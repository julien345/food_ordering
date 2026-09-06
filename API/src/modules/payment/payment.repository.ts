// src/modules/payment/payment.repository.ts
import prisma from "../../config/prisma";
import { PaymentStatus, PaymentMethod } from "../../generated/prisma/client";

type PrismaClientExecutor = Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

class PaymentRepository {
  private getClient(tx?: PrismaClientExecutor) {
    return tx || prisma;
  }

  findByOrderId(orderId: string) {
    return prisma.payment.findUnique({ where: { orderId } });
  }

  findByTransactionId(transactionId: string) {
    return prisma.payment.findUnique({ where: { transactionId } });
  }

  create(orderId: string, amount: number, method: PaymentMethod, transactionId: string, tx?: PrismaClientExecutor) {
    return this.getClient(tx).payment.create({
      data: { orderId, amount, method, status: "PENDING", transactionId },
    });
  }

  updateStatus(id: string, transactionId: string, status: PaymentStatus, tx?: PrismaClientExecutor) {
  return this.getClient(tx).payment.update({
    where: { id },
    data: { transactionId, status },
  });
}
}

export default new PaymentRepository();