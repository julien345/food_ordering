import { Request, Response } from "express";
import cartService from "./cart.service";

type CartItemParams = { itemId: string };

class CartController {
  async getCart(req: Request, res: Response) {
    const cart = await cartService.getCart(req.user!.userId);
    return res.status(200).json(cart);
  }

  async addItem(req: Request, res: Response) {
    const { dishId, quantity } = req.body;
    const item = await cartService.addItem(req.user!.userId, dishId, quantity);
    return res.status(201).json(item);
  }

  async updateItem(req: Request<CartItemParams>, res: Response) {
    const { quantity } = req.body;
    const item = await cartService.updateItemQuantity(req.user!.userId, req.params.itemId, quantity);
    return res.status(200).json(item);
  }

  async removeItem(req: Request<CartItemParams>, res: Response) {
    await cartService.removeItem(req.user!.userId, req.params.itemId);
    return res.status(204).send();
  }

  async clearCart(req: Request, res: Response) {
    await cartService.clearCart(req.user!.userId);
    return res.status(204).send();
  }
}

export default new CartController();