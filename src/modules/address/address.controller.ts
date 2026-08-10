import { Request, Response } from "express";
import addressService from "./address.service";

type AddressParams = { id: string };

class AddressController {
  async getAll(req: Request, res: Response) {
    const addresses = await addressService.getAll(req.user!.userId);
    return res.status(200).json(addresses);
  }

  async getById(req: Request<AddressParams>, res: Response) {
    const address = await addressService.getById(req.params.id, req.user!.userId);
    return res.status(200).json(address);
  }

  async create(req: Request, res: Response) {
    const address = await addressService.create(req.user!.userId, req.body);
    return res.status(201).json(address);
  }

  async update(req: Request<AddressParams>, res: Response) {
    const address = await addressService.update(req.params.id, req.user!.userId, req.body);
    return res.status(200).json(address);
  }

  async remove(req: Request<AddressParams>, res: Response) {
    await addressService.remove(req.params.id, req.user!.userId);
    return res.status(204).send();
  }
}

export default new AddressController();