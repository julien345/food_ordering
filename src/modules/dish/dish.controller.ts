import { Request, Response } from "express";
import dishService from "./dish.service";
import { parsePaginationParams } from "../../utils/pagination";

type DishParams = { id: string };
type DishQuery = { categoryId?: string; page?: string; limit?: string };

class DishController {
  async getAll(req: Request<{}, {}, {}, DishQuery>, res: Response) {
    if (req.query.categoryId) {
      const dishes = await dishService.getByCategory(req.query.categoryId);
      return res.status(200).json(dishes);
    }

    const paginationParams = parsePaginationParams(req.query);
    const result = await dishService.getAllPaginated(paginationParams);
    return res.status(200).json(result);
  }

  async getById(req: Request<DishParams>, res: Response) {
    const dish = await dishService.getById(req.params.id);
    return res.status(200).json(dish);
  }

  async create(req: Request, res: Response) {
    const dish = await dishService.create(req.body);
    return res.status(201).json(dish);
  }

  async update(req: Request<DishParams>, res: Response) {
    const dish = await dishService.update(req.params.id, req.body);
    return res.status(200).json(dish);
  }

  async remove(req: Request<DishParams>, res: Response) {
    await dishService.remove(req.params.id);
    return res.status(204).send();
  }
}

export default new DishController();