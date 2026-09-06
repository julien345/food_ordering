// order.repository.ts
import prisma from "../../config/prisma";
import { OrderStatus } from "../../generated/prisma/client";

type PrismaClientExecutor = Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export interface CreateOrderItemsInput {
  dishId: string;
  quantity: number;
  unitPrice: number;
  dishNameSnapshot: string;
  dishImageSnapshot: string | null;
}

class OrderRepository {
  private getClient(tx?: PrismaClientExecutor) {
    return tx || prisma;
  }

  findByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: true, address: true, payment: true, delivery: true },
      orderBy: { createdAt: "desc" },
    });
  }

  findAllPaginated(skip: number, take: number) {
    return prisma.$transaction([
      prisma.order.findMany({ include: { items: true, address: true, payment: true, delivery: true, user: true }, orderBy: { createdAt: "desc" }, skip, take }),
      prisma.order.count(),
    ]).then(([data, total]) => ({ data, total }));
  }

  findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { items: { include: { dish: true } }, address: true, payment: true, delivery: true },
    });
  }

  findStatusAndUser(id: string) {
    return prisma.order.findUnique({ where: { id }, select: { userId: true, status: true } });
  }

  findByOrderNumber(orderNumber: number) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: { items: { include: { dish: true } }, address: true, payment: true, delivery: true },
    });
  }
  
  findByUserIdPaginated(userId: string, skip: number, take: number) {
  return prisma.$transaction([
    prisma.order.findMany({
      where: { userId },
      include: { items: true, address: true, payment: true, delivery: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.order.count({ where: { userId } }),
  ]).then(([data, total]) => ({ data, total }));
}

 async createFromCart(
    userId: string,
    addressId: string,
    orderItems: CreateOrderItemsInput[],
    cartId: string,
    deliveryAddressSnapshot: string,
    tx: PrismaClientExecutor
  ) {
    const totalAmount = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    const order = await tx.order.create({
      data: {
        userId,
        addressId,
        totalAmount,
        deliveryAddressSnapshot,
        items: {
          create: orderItems.map((item) => ({
            dishId: item.dishId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            dishNameSnapshot: item.dishNameSnapshot,
            dishImageSnapshot: item.dishImageSnapshot,
          })),
        },
      },
      include: { items: true },
    });

    await tx.cartItem.deleteMany({ where: { cartId } });

    return order;
  }

  updateStatus(id: string, status: OrderStatus, tx?: PrismaClientExecutor) {
    return this.getClient(tx).order.update({ where: { id }, data: { status } });
  }
  

 
}

export default new OrderRepository();