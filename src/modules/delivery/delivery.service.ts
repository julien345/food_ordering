// src/modules/delivery/delivery.service.ts
import deliveryRepository from "./delivery.repository";
import orderRepository from "../order/order.repository";
import orderService from "../order/order.service";
import authRepository from "../auth/auth.repository";

class DeliveryService {
  async assign(orderId: string, agentId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.status !== "READY_FOR_DELIVERY") throw new Error("ORDER_NOT_READY");

    const existing = await deliveryRepository.findByOrderId(orderId);
    if (existing) throw new Error("DELIVERY_ALREADY_EXISTS");

    const agent = await authRepository.findById(agentId);
    if (!agent) throw new Error("AGENT_NOT_FOUND");
    if (agent.role !== "DELIVERY_AGENT") throw new Error("INVALID_AGENT_ROLE");

    const delivery = await deliveryRepository.create(orderId, agentId);

    // transition automatique de la commande
    await orderService.updateStatus(orderId, "OUT_FOR_DELIVERY", order.userId, "ADMIN");

    return delivery;
  }

  async getMyDeliveries(agentId: string) {
    return deliveryRepository.findByAgentId(agentId);
  }

 // delivery.service.ts
async markAsDelivered(deliveryId: string, userId: string, role: string) {
  const delivery = await deliveryRepository.findById(deliveryId);
  if (!delivery) throw new Error("DELIVERY_NOT_FOUND");

  if (role === "DELIVERY_AGENT" && delivery.agentId !== userId) {
    throw new Error("FORBIDDEN");
  }

  const order = await orderRepository.findById(delivery.orderId);
  if (!order) throw new Error("ORDER_NOT_FOUND");

  await deliveryRepository.markDelivered(deliveryId);
  return orderService.updateStatus(delivery.orderId, "DELIVERED", userId, role); // <-- userId, pas order.userId
}
}

export default new DeliveryService();