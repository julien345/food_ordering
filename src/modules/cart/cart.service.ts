import cartRepository from "./cart.repository";
import dishRepository from "../dish/dish.repository";
import { NotFoundError, ForbiddenError, ConflictError } from "../../errors";

class CartService {
  async getCart(userId: string) {
    const cart = await cartRepository.findByUserId(userId);
    if (!cart) throw new NotFoundError("Panier introuvable.");

    const total = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    return { ...cart, total };
  }

  async addItem(userId: string, dishId: string, quantity: number) {
    const cart = await cartRepository.findByUserId(userId);
    if (!cart) throw new NotFoundError("Panier introuvable.");

    const dish = await dishRepository.findById(dishId);
    if (!dish) throw new NotFoundError("Plat introuvable.");
    if (!dish.isAvailable) throw new ConflictError("Ce plat n'est plus disponible.");

    const existingItem = await cartRepository.findItemByCartAndDish(cart.id, dishId);

    if (existingItem) {
      return cartRepository.incrementItemQuantity(existingItem.id, quantity);
    }

    return cartRepository.addItem(cart.id, dishId, quantity, dish.price);
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    const item = await cartRepository.findItemById(itemId);
    if (!item) throw new NotFoundError("Article introuvable.");

    const cart = await cartRepository.findByUserId(userId);
    if (!cart || item.cartId !== cart.id) throw new ForbiddenError();

    return cartRepository.updateItemQuantity(itemId, quantity);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await cartRepository.findItemById(itemId);
    if (!item) throw new NotFoundError("Article introuvable.");

    const cart = await cartRepository.findByUserId(userId);
    if (!cart || item.cartId !== cart.id) throw new ForbiddenError();

    return cartRepository.removeItem(itemId);
  }

  async clearCart(userId: string) {
    const cart = await cartRepository.findByUserId(userId);
    if (!cart) throw new NotFoundError("Panier introuvable.");
    return cartRepository.clearCart(cart.id);
  }
}

export default new CartService();