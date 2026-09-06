import { Request, Response } from "express";
import orderService from "./order.service";
import { parsePaginationParams } from "../../utils/pagination";
import { BadRequestError } from "../../errors";

type OrderParams = { id: string };
type OrderQuery = { page?: string; limit?: string };
type OrderNumberParams = { orderNumber: string };
class OrderController {
  async getAll(req: Request<{}, {}, {}, OrderQuery>, res: Response) {
    const paginationParams = parsePaginationParams(req.query);
    const result = await orderService.getAllPaginated(paginationParams);
    return res.status(200).json(result);
  }

  async getByOrderNumber(req: Request<OrderNumberParams>, res: Response) {
  const orderNumber = Number(req.params.orderNumber);
  if (isNaN(orderNumber)) throw new BadRequestError("Numéro de commande invalide.");

  const order = await orderService.getByOrderNumber(orderNumber, req.user!.userId, req.user!.role);
  return res.status(200).json(order);
}

  async getMyOrders(req: Request<{}, {}, {}, OrderQuery>, res: Response) {
  const paginationParams = parsePaginationParams(req.query);
  const result = await orderService.getAllForUserPaginated(req.user!.userId, paginationParams);
  return res.status(200).json(result);
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