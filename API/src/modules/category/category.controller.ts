import { Request, Response } from "express";
import categoryService from "./category.service";

type CategoryParams = { id: string };

class CategoryController {
  async getAll(req: Request, res: Response) {
    const categories = await categoryService.getAll();
    return res.status(200).json(categories);
  }

  async getById(req: Request<CategoryParams>, res: Response) {
    const category = await categoryService.getById(req.params.id);
    return res.status(200).json(category);
  }

  async create(req: Request, res: Response) {
    const category = await categoryService.create(req.body);
    return res.status(201).json(category);
  }

  async update(req: Request<CategoryParams>, res: Response) {
    const category = await categoryService.update(req.params.id, req.body);
    return res.status(200).json(category);
  }

  async remove(req: Request<CategoryParams>, res: Response) {
    await categoryService.remove(req.params.id);
    return res.status(204).send();
  }
}

export default new CategoryController();