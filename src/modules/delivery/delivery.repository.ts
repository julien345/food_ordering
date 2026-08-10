// src/modules/delivery/delivery.repository.ts
import prisma from "../../config/prisma";

class DeliveryRepository {
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

  create(orderId: string, agentId: string) {
    return prisma.delivery.create({ data: { orderId, agentId } });
  }

  markDelivered(id: string) {
    return prisma.delivery.update({ where: { id }, data: { deliveredAt: new Date() } });
  }
}

export default new DeliveryRepository();