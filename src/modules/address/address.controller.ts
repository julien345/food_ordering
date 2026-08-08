// src/modules/address/address.controller.ts
import { Request, Response } from "express";
import addressService from "./address.service";

type AddressParams = { id: string };

class AddressController {
  async getAll(req: Request, res: Response) {
    const addresses = await addressService.getAll(req.user!.userId);
    return res.status(200).json(addresses);
  }

  async getById(req: Request<AddressParams>, res: Response) {
    try {
      const address = await addressService.getById(req.params.id, req.user!.userId);
      return res.status(200).json(address);
    } catch (err: any) {
      if (err.message === "ADDRESS_NOT_FOUND") {
        return res.status(404).json({ error: "Adresse introuvable." });
      }
      if (err.message === "FORBIDDEN") {
        return res.status(403).json({ error: "Accès refusé." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }

  async create(req: Request, res: Response) {
    const address = await addressService.create(req.user!.userId, req.body);
    return res.status(201).json(address);
  }

  async update(req: Request<AddressParams>, res: Response) {
    try {
      const address = await addressService.update(req.params.id, req.user!.userId, req.body);
      return res.status(200).json(address);
    } catch (err: any) {
      if (err.message === "ADDRESS_NOT_FOUND") {
        return res.status(404).json({ error: "Adresse introuvable." });
      }
      if (err.message === "FORBIDDEN") {
        return res.status(403).json({ error: "Accès refusé." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }

  async remove(req: Request<AddressParams>, res: Response) {
    try {
      await addressService.remove(req.params.id, req.user!.userId);
      return res.status(204).send();
    } catch (err: any) {
      if (err.message === "ADDRESS_NOT_FOUND") {
        return res.status(404).json({ error: "Adresse introuvable." });
      }
      if (err.message === "FORBIDDEN") {
        return res.status(403).json({ error: "Accès refusé." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }
}

export default new AddressController();