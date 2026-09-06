// src/modules/user/user.controller.ts
import { Request, Response } from "express";
import userService from "./user.service";
import { parsePaginationParams } from "../../utils/pagination";
import { Role } from "../../generated/prisma/client";

type UserParams = { id: string };
type UserQuery = { page?: string; limit?: string; role?: string };

class UserController {
  // Conserve la route générique existante
  async getAll(req: Request<{}, {}, {}, UserQuery>, res: Response) {
    const paginationParams = parsePaginationParams(req.query);
    const role = req.query.role as Role | undefined;
    const result = await userService.getAllPaginated(paginationParams, role);
    return res.status(200).json(result);
  }

  // Nouvelle méthode dédiée pour extraire uniquement les CLIENTS
  async getClients(req: Request<{}, {}, {}, UserQuery>, res: Response) {
    const paginationParams = parsePaginationParams(req.query);
    const result = await userService.getAllPaginated(paginationParams, "CLIENT" as Role);
    return res.status(200).json(result);
  }

  // Nouvelle méthode dédiée pour extraire uniquement les LIVREURS (DELIVERY_AGENT)
  async getDeliveryAgents(req: Request<{}, {}, {}, UserQuery>, res: Response) {
    const paginationParams = parsePaginationParams(req.query);
    const result = await userService.getAllPaginated(paginationParams, "DELIVERY_AGENT" as Role);
    return res.status(200).json(result);
  }

  // Nouvelle méthode dédiée pour extraire uniquement les ADMINISTRATEURS (ADMIN)
  async getAdmins(req: Request<{}, {}, {}, UserQuery>, res: Response) {
    const paginationParams = parsePaginationParams(req.query);
    const result = await userService.getAllPaginated(paginationParams, "ADMIN" as Role);
    return res.status(200).json(result);
  }

  async getById(req: Request<UserParams>, res: Response) {
    const user = await userService.getById(req.params.id);
    return res.status(200).json(user);
  }

  async create(req: Request, res: Response) {
    const user = await userService.createByAdmin(req.body);
    return res.status(201).json(user);
  }

  async updateRole(req: Request<UserParams>, res: Response) {
    const { role } = req.body;
    const user = await userService.updateRole(req.params.id, role);
    return res.status(200).json(user);
  }

  async remove(req: Request<UserParams>, res: Response) {
    await userService.remove(req.params.id);
    return res.status(204).send();
  }
}

export default new UserController();
