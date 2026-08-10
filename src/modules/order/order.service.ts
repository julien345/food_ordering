// order.service.ts
import orderRepository, { CreateOrderItemsInput } from "./order.repository";
import cartRepository from "../cart/cart.repository";
import addressRepository from "../address/address.repository";
import dishRepository from "../dish/dish.repository";
import deliveryRepository from "../delivery/delivery.repository";
import { OrderStatus } from "../../generated/prisma/client";
import { NotFoundError, ForbiddenError, ConflictError } from "../../errors";
import { parsePaginationParams, buildPaginatedResult, PaginationParams } from "../../utils/pagination";

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

    if (role === "CLIENT" && order.userId !== userId) {
      throw new ForbiddenError();
    }

    return order;
  }

  async createFromCart(userId: string, addressId: string) {
    const address = await addressRepository.findById(addressId);
    if (!address) throw new NotFoundError("Adresse introuvable.");
    if (address.userId !== userId) throw new ForbiddenError("Cette adresse ne vous appartient pas.");

    const cart = await cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) throw new ConflictError("Votre panier est vide.");

    const dishIds = cart.items.map((item) => item.dishId);
    const dbDishes = await dishRepository.findManyByIds(dishIds);
    const dishPriceMap = new Map(dbDishes.map((d) => [d.id, d.price]));

    const orderItems: CreateOrderItemsInput[] = cart.items.map((item) => {
      const realPrice = dishPriceMap.get(item.dishId);
      if (realPrice === undefined) throw new NotFoundError("Un des plats du panier n'existe plus.");
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
    if (!order) throw new NotFoundError("Commande introuvable.");

    if (role === "CLIENT" && order.userId !== userId) {
      throw new ForbiddenError();
    }

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

    return orderRepository.updateStatus(orderId, newStatus);
  }
}

export default new OrderService();