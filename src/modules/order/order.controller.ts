// src/modules/order/order.controller.ts
import { Request, Response } from "express";
import orderService from "./order.service";

type OrderParams = { id: string };

class OrderController {
  async getAll(req: Request, res: Response) {
    try {
      const orders = await orderService.getAll();
      return res.status(200).json(orders);
    } catch (err: any) {
      return res.status(500).json({ error: "Erreur serveur lors de la récupération des commandes." });
    }
  }

  async getMyOrders(req: Request, res: Response) {
    try {
      const orders = await orderService.getAllForUser(req.user!.userId);
      return res.status(200).json(orders);
    } catch (err: any) {
      return res.status(500).json({ error: "Erreur serveur lors de la récupération de vos commandes." });
    }
  }

  async getById(req: Request<OrderParams>, res: Response) {
    try {
      const order = await orderService.getById(req.params.id, req.user!.userId, req.user!.role);
      return res.status(200).json(order);
    } catch (err: any) {
      if (err.message === "ORDER_NOT_FOUND") {
        return res.status(404).json({ error: "Commande introuvable." });
      }
      if (err.message === "FORBIDDEN") {
        return res.status(403).json({ error: "Accès refusé." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { addressId } = req.body;
      const order = await orderService.createFromCart(req.user!.userId, addressId);
      return res.status(201).json(order);
    } catch (err: any) {
      if (err.message === "ADDRESS_NOT_FOUND") {
        return res.status(404).json({ error: "Adresse introuvable." });
      }
      if (err.message === "FORBIDDEN") {
        return res.status(403).json({ error: "Cette adresse ne vous appartient pas." });
      }
      if (err.message === "CART_EMPTY") {
        return res.status(409).json({ error: "Votre panier est vide." });
      }
      if (err.message === "DISH_NOT_FOUND") {
        return res.status(404).json({ error: "Un des plats du panier n'existe plus." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }

  async updateStatus(req: Request<OrderParams>, res: Response) {
    try {
      const { status } = req.body;
      const order = await orderService.updateStatus(req.params.id, status, req.user!.userId, req.user!.role);
      return res.status(200).json(order);
    } catch (err: any) {
      if (err.message === "ORDER_NOT_FOUND") {
        return res.status(404).json({ error: "Commande introuvable." });
      }
      if (err.message === "FORBIDDEN") {
        return res.status(403).json({ error: "Accès refusé." });
      }
      if (err.message === "INVALID_TRANSITION") {
        return res.status(409).json({ error: "Transition de statut invalide." });
      }
      if (err.message === "ROLE_NOT_ALLOWED") {
        return res.status(403).json({ error: "Votre rôle ne permet pas cette action." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }
}

export default new OrderController();