import { Request, Response } from "express";
import deliveryService from "./delivery.service";

type DeliveryParams = { id: string };

class DeliveryController {
  async assign(req: Request, res: Response) {
    const { orderId, agentId } = req.body;
    const delivery = await deliveryService.assign(orderId, agentId);
    return res.status(201).json(delivery);
  }

  async getMyDeliveries(req: Request, res: Response) {
    const deliveries = await deliveryService.getMyDeliveries(req.user!.userId);
    return res.status(200).json(deliveries);
  }

  async markAsDelivered(req: Request<DeliveryParams>, res: Response) {
    const delivery = await deliveryService.markAsDelivered(req.params.id, req.user!.userId, req.user!.role);
    return res.status(200).json(delivery);
  }
}

export default new DeliveryController();