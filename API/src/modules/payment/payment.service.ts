// payment.service.ts
import paymentRepository from "./payment.repository";
import orderRepository from "../order/order.repository";
import orderService from "../order/order.service";
import prisma from "../../config/prisma";
import { getPaymentProvider } from "./providers/PaymentProviderRegistry";
import { PaymentMethod } from "../../generated/prisma/client";
import { NotFoundError, ForbiddenError, ConflictError } from "../../errors";

class PaymentService {
  
  async initiate(orderId: string, userId: string, method: PaymentMethod) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Commande introuvable.");
    if (order.userId !== userId) throw new ForbiddenError();
    if (order.status !== "PENDING") {
      throw new ConflictError("Cette commande n'est plus en attente de paiement.");
    }

    const existingPayment = await paymentRepository.findByOrderId(orderId);
    if (existingPayment && existingPayment.status === "SUCCESS") {
      throw new ConflictError("Cette commande a déjà été payée.");
    }

    const provider = getPaymentProvider(method);

    const { paymentUrl, providerReference } = await provider.initiatePayment({
      orderId,
      currency: "xaf",
      items: order.items.map((item) => ({
        name: item.dish.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      })),
    });

    if (existingPayment) {
      // Correction : on met à jour transactionId ET status ensemble,
      // sinon le webhook cherchera l'ancienne référence Stripe abandonnée.
      await paymentRepository.updateStatus(existingPayment.id, providerReference, "PENDING");
    } else {
      await paymentRepository.create(orderId, order.totalAmount, method, providerReference);
    }

    return { paymentUrl };
  }

  async handleWebhook(method: PaymentMethod, rawBody: Buffer, signature: string) {
    const provider = getPaymentProvider(method);
    const event = provider.constructWebhookEvent(rawBody, signature);
    const result = provider.extractWebhookResult(event);

    if (!result) return;

    const payment = await paymentRepository.findByTransactionId(result.providerReference);
    if (!payment || !payment.transactionId) return;

    const transactionId: string = payment.transactionId;

    // Transaction : le paiement ET la commande avancent ensemble, ou aucun des deux ne change.
    await prisma.$transaction(async (tx) => {
      
      await paymentRepository.updateStatus(payment.id, transactionId, result.status, tx);

      if (result.status === "SUCCESS") {
        const order = await orderRepository.findById(payment.orderId);
        if (order && order.status === "PENDING") {
          await orderService.updateStatus(payment.orderId, "CONFIRMED", order.userId, "SYSTEM", tx);
        }
      }
    });
  }
}

export default new PaymentService();
