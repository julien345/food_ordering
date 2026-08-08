import { Request, Response } from "express";
import cartService from "./cart.service";

type CartItemParams = { itemId: string };

class CartController {
  async getCart(req: Request, res: Response) {
    try {
      const cart = await cartService.getCart(req.user!.userId);
      return res.status(200).json(cart);
    } catch (err: any) {
      if (err.message === "CART_NOT_FOUND") {
        return res.status(404).json({ error: "Panier introuvable." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }

  async addItem(req: Request, res: Response) {
    try {
      const { dishId, quantity } = req.body;
      const item = await cartService.addItem(req.user!.userId, dishId, quantity);
      return res.status(201).json(item);
    } catch (err: any) {
      if (err.message === "CART_NOT_FOUND") {
        return res.status(404).json({ error: "Panier introuvable." });
      }
      if (err.message === "DISH_NOT_FOUND") {
        return res.status(404).json({ error: "Plat introuvable." });
      }
      if (err.message === "DISH_UNAVAILABLE") {
        return res.status(409).json({ error: "Ce plat n'est plus disponible." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }

  async updateItem(req: Request<CartItemParams>, res: Response) {
    try {
      const { quantity } = req.body;
      const item = await cartService.updateItemQuantity(req.user!.userId, req.params.itemId, quantity);
      return res.status(200).json(item);
    } catch (err: any) {
      if (err.message === "ITEM_NOT_FOUND") {
        return res.status(404).json({ error: "Article introuvable." });
      }
      if (err.message === "FORBIDDEN") {
        return res.status(403).json({ error: "Accès refusé." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }

  async removeItem(req: Request<CartItemParams>, res: Response) {
    try {
      await cartService.removeItem(req.user!.userId, req.params.itemId);
      return res.status(204).send();
    } catch (err: any) {
      if (err.message === "ITEM_NOT_FOUND") {
        return res.status(404).json({ error: "Article introuvable." });
      }
      if (err.message === "FORBIDDEN") {
        return res.status(403).json({ error: "Accès refusé." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }

  async clearCart(req: Request, res: Response) {
    try {
      await cartService.clearCart(req.user!.userId);
      return res.status(204).send();
    } catch (err: any) {
      if (err.message === "CART_NOT_FOUND") {
        return res.status(404).json({ error: "Panier introuvable." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }
}

export default new CartController();