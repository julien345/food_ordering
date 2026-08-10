// delivery.service.ts
import deliveryRepository from "./delivery.repository";
import orderRepository from "../order/order.repository";
import orderService from "../order/order.service";
import authRepository from "../auth/auth.repository";
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from "../../errors";

class DeliveryService {
  async assign(orderId: string, agentId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Commande introuvable.");
    if (order.status !== "READY_FOR_DELIVERY") {
      throw new ConflictError("La commande n'est pas prête pour la livraison.");
    }

    const existing = await deliveryRepository.findByOrderId(orderId);
    if (existing) throw new ConflictError("Une livraison existe déjà pour cette commande.");

    const agent = await authRepository.findById(agentId);
    if (!agent) throw new NotFoundError("Livreur introuvable.");
    if (agent.role !== "DELIVERY_AGENT") {
      throw new BadRequestError("Cet utilisateur n'est pas un livreur.");
    }

    const delivery = await deliveryRepository.create(orderId, agentId);

    await orderService.updateStatus(orderId, "OUT_FOR_DELIVERY", order.userId, "ADMIN");

    return delivery;
  }

  async getMyDeliveries(agentId: string) {
    return deliveryRepository.findByAgentId(agentId);
  }

  async markAsDelivered(deliveryId: string, userId: string, role: string) {
    const delivery = await deliveryRepository.findById(deliveryId);
    if (!delivery) throw new NotFoundError("Livraison introuvable.");

    if (role === "DELIVERY_AGENT" && delivery.agentId !== userId) {
      throw new ForbiddenError("Cette livraison ne vous est pas assignée.");
    }

    const order = await orderRepository.findById(delivery.orderId);
    if (!order) throw new NotFoundError("Commande introuvable.");

    await deliveryRepository.markDelivered(deliveryId);
    return orderService.updateStatus(delivery.orderId, "DELIVERED", userId, role);
  }
}

export default new DeliveryService();