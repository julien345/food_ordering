// src/modules/category/category.controller.ts
import { Request, Response } from "express";
import categoryService from "./category.service";

type CategoryParams = {
  id: string;
}
 class CategoryController {
  async getAll(req: Request, res: Response) {
    const categories = await categoryService.getAll();
    return res.status(200).json(categories);
  }

  async getById(req: Request<CategoryParams>, res: Response) {
    try {
      const category = await categoryService.getById(req.params.id);
      return res.status(200).json(category);
    } catch (err: any) {
      if (err.message === "CATEGORY_NOT_FOUND") {
        return res.status(404).json({ error: "Catégorie introuvable." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const category = await categoryService.create(req.body);
      return res.status(201).json(category);
    } catch (err: any) {
      if (err.message === "CATEGORY_ALREADY_EXISTS") {
        return res.status(409).json({ error: "Cette catégorie existe déjà." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }

  async update(req: Request<CategoryParams>, res: Response) {
    try {
      const category = await categoryService.update(req.params.id, req.body);
      return res.status(200).json(category);
    } catch (err: any) {
      if (err.message === "CATEGORY_NOT_FOUND") {
        return res.status(404).json({ error: "Catégorie introuvable." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }

  async remove(req: Request<CategoryParams>, res: Response) {
    try {
      await categoryService.remove(req.params.id);
      return res.status(204).send();
    } catch (err: any) {
      if (err.message === "CATEGORY_NOT_FOUND") {
        return res.status(404).json({ error: "Catégorie introuvable." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }
}

export default new CategoryController();