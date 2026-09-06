import { Request, Response } from "express";
import orderService from "./order.service";
import { parsePaginationParams } from "../../utils/pagination";

type OrderParams = { id: string };
type OrderQuery = { page?: string; limit?: string };

class OrderController {
  async getAll(req: Request<{}, {}, {}, OrderQuery>, res: Response) {
    const paginationParams = parsePaginationParams(req.query);
    const result = await orderService.getAllPaginated(paginationParams);
    return res.status(200).json(result);
  }

  async getMyOrders(req: Request, res: Response) {
    const orders = await orderService.getAllForUser(req.user!.userId);
    return res.status(200).json(orders);
  }

  async getById(req: Request<OrderParams>, res: Response) {
    const order = await orderService.getById(req.params.id, req.user!.userId, req.user!.role);
    return res.status(200).json(order);
  }

  async create(req: Request, res: Response) {
    const { addressId } = req.body;
    const order = await orderService.createFromCart(req.user!.userId, addressId);
    return res.status(201).json(order);
  }

  async updateStatus(req: Request<OrderParams>, res: Response) {
    const { status } = req.body;
    const order = await orderService.updateStatus(req.params.id, status, req.user!.userId, req.user!.role);
    return res.status(200).json(order);
  }
}

export default new OrderController();