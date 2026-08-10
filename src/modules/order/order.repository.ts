// src/modules/order/order.repository.ts
import prisma from "../../config/prisma";
import { OrderStatus } from "../../generated/prisma/client";

export interface CreateOrderItemsInput {
  dishId: string;
  quantity: number;
  unitPrice: number;
}

class OrderRepository {
  findByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: true, address: true, payment: true, delivery: true },
      orderBy: { createdAt: "desc" },
    });
  }

  findAll() {
    // TODO : ajouter pagination (take, skip) en Semaine 5
    return prisma.order.findMany({
      include: { items: true, address: true, payment: true, delivery: true, user: true },
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { items: { include: { dish: true } }, address: true, payment: true, delivery: true },
    });
  }

  findStatusAndUser(id: string) {
    return prisma.order.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });
  }

  createFromCart(userId: string, addressId: string, orderItems: CreateOrderItemsInput[], cartId: string) {
    const totalAmount = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          addressId,
          totalAmount,
          items: {
            create: orderItems.map((item) => ({
              dishId: item.dishId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { cartId } });

      return order;
    });
  }

  updateStatus(id: string, status: OrderStatus) {
    return prisma.order.update({ where: { id }, data: { status } });
  }
}

export default new OrderRepository();