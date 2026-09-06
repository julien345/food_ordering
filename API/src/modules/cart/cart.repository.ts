// src/modules/cart/cart.repository.ts
import prisma from "../../config/prisma";

type PrismaClientExecutor = Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

class CartRepository {
  private getClient(tx?: PrismaClientExecutor) {
    return tx || prisma;
  }

  findByUserId(userId: string, tx?: PrismaClientExecutor) {
    return this.getClient(tx).cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: { dish: true },
        },
      },
    });
  }

  findItemById(id: string) {
    return prisma.cartItem.findFirst({
      where: { id },
      include: { cart: true },
    });
  }

  upsertItem(cartId: string, dishId: string, quantity: number) {
    return prisma.cartItem.upsert({
      where: { cartId_dishId: { cartId, dishId } },
      update: { quantity: { increment: quantity } },
      create: { cartId, dishId, quantity },
    });
  }

  updateItemQuantity(id: string, quantity: number) {
    return prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });
  }

  removeItem(id: string) {
    return prisma.cartItem.delete({ where: { id } });
  }

  clearCart(cartId: string, tx?: PrismaClientExecutor) {
    return this.getClient(tx).cartItem.deleteMany({ where: { cartId } });
  }

  removeItemsByDishId(dishId: string, tx?: PrismaClientExecutor) {
  return this.getClient(tx).cartItem.deleteMany({ where: { dishId } });
}
}

export default new CartRepository();