// order.service.ts
import orderRepository, { CreateOrderItemsInput } from "./order.repository";
import cartRepository from "../cart/cart.repository";
import addressRepository from "../address/address.repository";
import dishRepository from "../dish/dish.repository";
import deliveryRepository from "../delivery/delivery.repository";
import prisma from "../../config/prisma";
import { OrderStatus } from "../../generated/prisma/client";
import { NotFoundError, ForbiddenError, ConflictError } from "../../errors";
import { parsePaginationParams, buildPaginatedResult, PaginationParams } from "../../utils/pagination";

type PrismaClientExecutor = Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

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
  "PENDING->CONFIRMED": ["ADMIN", "SYSTEM"],
  "PENDING->CANCELLED": ["CLIENT", "ADMIN"],
  "CONFIRMED->PREPARING": ["ADMIN"],
  "CONFIRMED->CANCELLED": ["ADMIN"],
  "PREPARING->READY_FOR_DELIVERY": ["ADMIN"],
  "PREPARING->CANCELLED": ["ADMIN"],
  "READY_FOR_DELIVERY->OUT_FOR_DELIVERY": ["ADMIN"],
  "OUT_FOR_DELIVERY->DELIVERED": ["ADMIN", "DELIVERY_AGENT"],
};

class OrderService {
  async getAllPaginated(params: PaginationParams) {
    const skip = (params.page - 1) * params.limit;
    const { data, total } = await orderRepository.findAllPaginated(skip, params.limit);
    return buildPaginatedResult(data, total, params);
  }

  async getAllForUser(userId: string) {
    return orderRepository.findByUserId(userId);
  }

  async getById(id: string, userId: string, role: string) {
    const order = await orderRepository.findById(id);
    if (!order) throw new NotFoundError("Commande introuvable.");
    if (role === "CLIENT" && order.userId !== userId) throw new ForbiddenError();
    return order;
  }

  async getAllForUserPaginated(userId: string, params: PaginationParams) {
  const skip = (params.page - 1) * params.limit;
  const { data, total } = await orderRepository.findByUserIdPaginated(userId, skip, params.limit);
  return buildPaginatedResult(data, total, params);
}

async createFromCart(userId: string, addressId: string) {
  const address = await addressRepository.findById(addressId);
  if (!address) throw new NotFoundError("Adresse introuvable.");
  if (address.userId !== userId) throw new ForbiddenError("Cette adresse ne vous appartient pas.");

  const deliveryAddressSnapshot = `${address.label} - ${address.street}, ${address.city}`;

  return prisma.$transaction(async (tx) => {
    const cart = await cartRepository.findByUserId(userId, tx);
    if (!cart || cart.items.length === 0) {
      throw new ConflictError("Votre panier est vide.");
    }

    const dishIds = cart.items.map((item) => item.dishId);
    const dbDishes = await dishRepository.findManyByIds(dishIds, tx);
    const dishMap = new Map(dbDishes.map((d) => [d.id, d]));

    const orderItems: CreateOrderItemsInput[] = cart.items.map((item) => {
      const dish = dishMap.get(item.dishId);
      if (!dish) throw new NotFoundError("Un des plats du panier n'existe plus.");
      if (!dish.isAvailable) throw new ConflictError("Un des plats de votre panier n'est plus disponible.");
      return {
        dishId: item.dishId,
        quantity: item.quantity,
        unitPrice: dish.price,
        dishNameSnapshot: dish.name,
        dishImageSnapshot: dish.image
      };
    });

    return orderRepository.createFromCart(userId, addressId, orderItems, cart.id, deliveryAddressSnapshot, tx);
  });
}

async getByOrderNumber(orderNumber: number, userId: string, role: string) {
  const order = await orderRepository.findByOrderNumber(orderNumber);
  if (!order) throw new NotFoundError("Commande introuvable.");
  if (role === "CLIENT" && order.userId !== userId) throw new ForbiddenError();
  return order;
}

  async updateStatus(orderId: string, newStatus: OrderStatus, userId: string, role: string, tx?: PrismaClientExecutor) {
    const order = await orderRepository.findStatusAndUser(orderId);
    if (!order) throw new NotFoundError("Commande introuvable.");
    if (role === "CLIENT" && order.userId !== userId) throw new ForbiddenError();

    const currentStatus = order.status;
    if (!ALLOWED_TRANSITIONS[currentStatus].includes(newStatus)) {
      throw new ConflictError("Transition de statut invalide.");
    }

    const transitionKey = `${currentStatus}->${newStatus}`;
    const allowedRoles = TRANSITION_ROLES[transitionKey] ?? [];
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenError("Votre rôle ne permet pas cette action.");
    }

    if (transitionKey === "OUT_FOR_DELIVERY->DELIVERED" && role === "DELIVERY_AGENT") {
      const delivery = await deliveryRepository.findByOrderId(orderId);
      if (!delivery || delivery.agentId !== userId) {
        throw new ForbiddenError("Cette livraison ne vous est pas assignée.");
      }
    }

    return orderRepository.updateStatus(orderId, newStatus, tx);
  }

}

export default new OrderService();