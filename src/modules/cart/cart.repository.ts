import prisma from "../../config/prisma";

class CartRepository {
  findByUserId(userId: string) {
    return prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: { dish: true },
        },
      },
    });
  }

  findItemByCartAndDish(cartId: string, dishId: string) {
    return prisma.cartItem.findFirst({
      where: { cartId, dishId },
    });
  }

  findItemById(id: string) {
    return prisma.cartItem.findFirst({
      where: { id },
      include: { cart: true },
    });
  }

  addItem(cartId: string, dishId: string, quantity: number, unitPrice: number) {
    return prisma.cartItem.create({
      data: { cartId, dishId, quantity, unitPrice },
    });
  }

  incrementItemQuantity(id: string, quantity: number) {
    return prisma.cartItem.update({
      where: { id },
      data: { quantity: { increment: quantity } },
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

  clearCart(cartId: string) {
    return prisma.cartItem.deleteMany({ where: { cartId } });
  }
}

export default new CartRepository();