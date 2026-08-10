import orderRepository, { CreateOrderItemsInput } from "./order.repository";
import cartRepository from "../cart/cart.repository";
import addressRepository from "../address/address.repository";
import dishRepository from "../dish/dish.repository";
import deliveryRepository from "../delivery/delivery.repository"
import { OrderStatus } from "../../generated/prisma/client";

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY_FOR_DELIVERY", "CANCELLED"],
  READY_FOR_DELIVERY: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const TRANSITION_ROLES: Record<string, string[]> = {
  "PENDING->CONFIRMED": ["ADMIN"],
  "PENDING->CANCELLED": ["CLIENT", "ADMIN"],
  "CONFIRMED->PREPARING": ["ADMIN"],
  "CONFIRMED->CANCELLED": ["ADMIN"],
  "PREPARING->READY_FOR_DELIVERY": ["ADMIN"],
  "PREPARING->CANCELLED": ["ADMIN"],
  "READY_FOR_DELIVERY->OUT_FOR_DELIVERY": ["ADMIN"],
  "OUT_FOR_DELIVERY->DELIVERED": ["ADMIN", "DELIVERY_AGENT"],
};

class OrderService {
  async getAll() {
    return orderRepository.findAll();
  }

  async getAllForUser(userId: string) {
    return orderRepository.findByUserId(userId);
  }

  async getById(id: string, userId: string, role: string) {
    const order = await orderRepository.findById(id);
    if (!order) throw new Error("ORDER_NOT_FOUND");

    if (role === "CLIENT" && order.userId !== userId) {
      throw new Error("FORBIDDEN");
    }

    return order;
  }

  async createFromCart(userId: string, addressId: string) {
    const address = await addressRepository.findById(addressId);
    if (!address) throw new Error("ADDRESS_NOT_FOUND");
    if (address.userId !== userId) throw new Error("FORBIDDEN");

    const cart = await cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) throw new Error("CART_EMPTY");

    // Sécurité anti-fraude : on récupère le prix réel et actuel des plats en base,
    // plutôt que de faire confiance au unitPrice figé dans le panier.
    // findManyByIds filtre déjà deletedAt: null (via dishRepository).
    const dishIds = cart.items.map((item) => item.dishId);
    const dbDishes = await dishRepository.findManyByIds(dishIds);
    const dishPriceMap = new Map(dbDishes.map((d) => [d.id, d.price]));

    const orderItems: CreateOrderItemsInput[] = cart.items.map((item) => {
      const realPrice = dishPriceMap.get(item.dishId);
      if (realPrice === undefined) throw new Error("DISH_NOT_FOUND"); // plat supprimé entre-temps
      return {
        dishId: item.dishId,
        quantity: item.quantity,
        unitPrice: realPrice,
      };
    });

    return orderRepository.createFromCart(userId, addressId, orderItems, cart.id);
  }

  async updateStatus(orderId: string, newStatus: OrderStatus, userId: string, role: string) {
  const order = await orderRepository.findStatusAndUser(orderId);
  if (!order) throw new Error("ORDER_NOT_FOUND");

  if (role === "CLIENT" && order.userId !== userId) {
    throw new Error("FORBIDDEN");
  }

  const currentStatus = order.status;

  if (!ALLOWED_TRANSITIONS[currentStatus].includes(newStatus)) {
    throw new Error("INVALID_TRANSITION");
  }

  const transitionKey = `${currentStatus}->${newStatus}`;
  const allowedRoles = TRANSITION_ROLES[transitionKey] ?? [];
  if (!allowedRoles.includes(role)) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  // Durcissement : un DELIVERY_AGENT ne peut marquer comme livrée QUE
  // la commande qui lui est réellement assignée via Delivery
  if (transitionKey === "OUT_FOR_DELIVERY->DELIVERED" && role === "DELIVERY_AGENT") {
    const delivery = await deliveryRepository.findByOrderId(orderId);
    if (!delivery || delivery.agentId !== userId) {
      throw new Error("FORBIDDEN");
    }
  }

  return orderRepository.updateStatus(orderId, newStatus);
}
}

export default new OrderService();