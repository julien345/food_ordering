// src/modules/dish/dish.controller.ts
import { Request, Response } from "express";
import dishService from "./dish.service";

type DishParams = { id: string };
type CategoryQuery = { categoryId?: string };

class DishController {
  async getAll(req: Request<{}, {}, {}, CategoryQuery>, res: Response) {
    try {
      if (req.query.categoryId) {
        const dishes = await dishService.getByCategory(req.query.categoryId);
        return res.status(200).json(dishes);
      }
      const dishes = await dishService.getAll();
      return res.status(200).json(dishes);
    } catch (err: any) {
      if (err.message === "CATEGORY_NOT_FOUND") {
        return res.status(404).json({ error: "Catégorie introuvable." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }

  async getById(req: Request<DishParams>, res: Response) {
    try {
      const dish = await dishService.getById(req.params.id);
      return res.status(200).json(dish);
    } catch (err: any) {
      if (err.message === "DISH_NOT_FOUND") {
        return res.status(404).json({ error: "Plat introuvable." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const dish = await dishService.create(req.body);
      return res.status(201).json(dish);
    } catch (err: any) {
      if (err.message === "CATEGORY_NOT_FOUND") {
        return res.status(404).json({ error: "Catégorie introuvable." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }

  async update(req: Request<DishParams>, res: Response) {
    try {
      const dish = await dishService.update(req.params.id, req.body);
      return res.status(200).json(dish);
    } catch (err: any) {
      if (err.message === "DISH_NOT_FOUND") {
        return res.status(404).json({ error: "Plat introuvable." });
      }
      if (err.message === "CATEGORY_NOT_FOUND") {
        return res.status(404).json({ error: "Catégorie introuvable." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }

  async remove(req: Request<DishParams>, res: Response) {
    try {
      await dishService.remove(req.params.id);
      return res.status(204).send();
    } catch (err: any) {
      if (err.message === "DISH_NOT_FOUND") {
        return res.status(404).json({ error: "Plat introuvable." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }
}

export default new DishController();