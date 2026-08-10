// src/modules/delivery/delivery.controller.ts
import { Request, Response } from "express";
import deliveryService from "./delivery.service";

type DeliveryParams = { id: string };

class DeliveryController {
  async assign(req: Request, res: Response) {
    try {
      const { orderId, agentId } = req.body;
      const delivery = await deliveryService.assign(orderId, agentId);
      return res.status(201).json(delivery);
    } catch (err: any) {
      console.error("ASSIGN DELIVERY ERROR:", err);
      if (err.message === "ORDER_NOT_FOUND") {
        return res.status(404).json({ error: "Commande introuvable." });
      }
      if (err.message === "ORDER_NOT_READY") {
        return res.status(409).json({ error: "La commande n'est pas prête pour la livraison." });
      }
      if (err.message === "DELIVERY_ALREADY_EXISTS") {
        return res.status(409).json({ error: "Une livraison existe déjà pour cette commande." });
      }
      if (err.message === "AGENT_NOT_FOUND") {
        return res.status(404).json({ error: "Livreur introuvable." });
      }
      if (err.message === "INVALID_AGENT_ROLE") {
        return res.status(400).json({ error: "Cet utilisateur n'est pas un livreur." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }

  async getMyDeliveries(req: Request, res: Response) {
    const deliveries = await deliveryService.getMyDeliveries(req.user!.userId);
    return res.status(200).json(deliveries);
  }

  async markAsDelivered(req: Request<DeliveryParams>, res: Response) {
    try {
      const delivery = await deliveryService.markAsDelivered(req.params.id, req.user!.userId, req.user!.role);
      return res.status(200).json(delivery);
    } catch (err: any) {
      console.error("MARK DELIVERED ERROR:", err);
      if (err.message === "DELIVERY_NOT_FOUND") {
        return res.status(404).json({ error: "Livraison introuvable." });
      }
      if (err.message === "FORBIDDEN") {
        return res.status(403).json({ error: "Cette livraison ne vous est pas assignée." });
      }
      if (err.message === "ORDER_NOT_FOUND") {
        return res.status(404).json({ error: "Commande introuvable." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }
}

export default new DeliveryController();