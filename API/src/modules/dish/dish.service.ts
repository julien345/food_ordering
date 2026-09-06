import dishRepository from "./dish.repository";
import categoryRepository from "../category/category.repository";
import cartRepository from "../cart/cart.repository";
import { NotFoundError } from "../../errors";
import prisma from "../../config/prisma";
import { parsePaginationParams, buildPaginatedResult, PaginationParams } from "../../utils/pagination";

class DishService {
  async getAll() {
    return dishRepository.findAll();
  }

  async getAllPaginated(params: PaginationParams) {
    const skip = (params.page - 1) * params.limit;
    const { data, total } = await dishRepository.findAllPaginated(skip, params.limit);
    return buildPaginatedResult(data, total, params);
  }

  // ✅ MIS À JOUR : Accepte désormais le paramètre optionnel 'tx'
  async getById(id: string, tx?: any) {
    const dish = await dishRepository.findById(id, tx);
    if (!dish) throw new NotFoundError("Plat introuvable.");
    return dish;
  }

  async getByCategory(categoryId: string) {
    const category = await categoryRepository.findById(categoryId);
    if (!category) throw new NotFoundError("Catégorie introuvable.");
    return dishRepository.findByCategory(categoryId);
  }

  async create(data: {
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    categoryId: string;
  }) {
    const category = await categoryRepository.findById(data.categoryId);
    if (!category) throw new NotFoundError("Catégorie introuvable.");
    return dishRepository.create(data);
  }

  async update(
    id: string,
    data: { name?: string; description?: string; price?: number; imageUrl?: string; categoryId?: string; isAvailable?: boolean }
  ) {
    // Cas où le plat devient indisponible : tout doit être atomique
    if (data.isAvailable === false) {
      return prisma.$transaction(async (tx) => {
        // 1. Vérification sécurisée à l'intérieur de la transaction
        await this.getById(id, tx);

        if (data.categoryId) {
          const category = await categoryRepository.findById(data.categoryId, tx);
          if (!category) throw new NotFoundError("Catégorie introuvable.");
        }

        // 2. Nettoyage préventif des paniers (évite les bugs de verrous)
        await cartRepository.removeItemsByDishId(id, tx);

        // 3. Mise à jour du plat dans la base de données
        const updated = await dishRepository.update(id, data, tx);
        
        return updated;
      });
    }

    // Cas standard (le plat reste disponible)
    await this.getById(id);

    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId);
      if (!category) throw new NotFoundError("Catégorie introuvable.");
    }

    return dishRepository.update(id, data);
  }

  async remove(id: string) {
    return prisma.$transaction(async (tx) => {
      await this.getById(id, tx);
      await cartRepository.removeItemsByDishId(id, tx);
      return dishRepository.softDelete(id, tx);
    });
  }
}

export default new DishService();
