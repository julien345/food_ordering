import { Request, Response } from "express";
import addressService from "./address.service";
import { UnauthorizedError } from "../../errors";

type AddressParams = { id: string };

class AddressController {
  private getUserIdOrThrow(req: Request): string {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedError("Utilisateur non authentifié.");
    return userId;
  }

  async getAll(req: Request, res: Response) {
    const userId = this.getUserIdOrThrow(req);
    const addresses = await addressService.getAll(userId);
    return res.status(200).json(addresses);
  }

  async getById(req: Request<AddressParams>, res: Response) {
    const userId = this.getUserIdOrThrow(req);
    const address = await addressService.getById(req.params.id, userId);
    return res.status(200).json(address);
  }

  async create(req: Request, res: Response) {
    const userId = this.getUserIdOrThrow(req);
    const address = await addressService.create(userId, req.body);
    return res.status(201).json(address);
  }

  async update(req: Request<AddressParams>, res: Response) {
    const userId = this.getUserIdOrThrow(req);
    const address = await addressService.update(req.params.id, userId, req.body);
    return res.status(200).json(address);
  }

  async remove(req: Request<AddressParams>, res: Response) {
    const userId = this.getUserIdOrThrow(req);
    await addressService.remove(req.params.id, userId);
    return res.status(204).send();
  }
}

export default new AddressController();