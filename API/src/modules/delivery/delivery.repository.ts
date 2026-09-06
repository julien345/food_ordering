// delivery.repository.ts
import prisma from "../../config/prisma";

type PrismaClientExecutor = Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

class DeliveryRepository {
  private getClient(tx?: PrismaClientExecutor) {
    return tx || prisma;
  }

  findByOrderId(orderId: string) {
    return prisma.delivery.findUnique({ where: { orderId } });
  }

  findById(id: string) {
    return prisma.delivery.findUnique({ where: { id } });
  }

  findByAgentId(agentId: string) {
    return prisma.delivery.findMany({
      where: { agentId },
      include: { order: true },
      orderBy: { createdAt: "desc" },
    });
  }

  create(orderId: string, agentId: string, tx?: PrismaClientExecutor) {
    return this.getClient(tx).delivery.create({ data: { orderId, agentId } });
  }

  markDelivered(id: string, tx?: PrismaClientExecutor) {
    return this.getClient(tx).delivery.update({ where: { id }, data: { deliveredAt: new Date() } });
  }
}

export default new DeliveryRepository();