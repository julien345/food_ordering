import categoryRepository from "./category.repository";
import dishRepository from "../dish/dish.repository";
import cartRepository from "../cart/cart.repository";
import { NotFoundError, ConflictError } from "../../errors";
import prisma from "../../config/prisma";

class CategoryService {
  async getAll() {
    return categoryRepository.findAll();
  }

  async getById(id: string, tx?: any) {
    const category = await categoryRepository.findById(id, tx);
    if (!category) throw new NotFoundError("Catégorie introuvable.");
    return category;
  }

  async create(data: { name: string; imageUrl?: string }, tx?: any) {
    const existing = await categoryRepository.findByName(data.name, tx);
    if (existing) throw new ConflictError("Cette catégorie existe déjà.");
    return categoryRepository.create(data, tx);
  }

  async update(id: string, data: { name?: string; imageUrl?: string }, tx?: any) {
    await this.getById(id, tx);

    if (data.name) {
      const existing = await categoryRepository.findByName(data.name, tx);
      if (existing && existing.id !== id) {
        throw new ConflictError("Une autre catégorie porte déjà ce nom.");
      }
    }

    return categoryRepository.update(id, data, tx);
  }

  // ✅ MIS À JOUR : Gère la suppression en cascade de manière atomique
  async remove(id: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Vérifier que la catégorie existe
      await this.getById(id, tx);

      // 2. Trouver tous les plats associés à cette catégorie
      const dishes = await dishRepository.findByCategory(id, tx);
      const dishIds = dishes.map((dish) => dish.id);

      if (dishIds.length > 0) {
        // 3. Vider les paniers contenant ces plats
        // (Note : nécessite d'ajouter une méthode removeItemsByDishIds ou de boucler)
        for (const dishId of dishIds) {
          await cartRepository.removeItemsByDishId(dishId, tx);
        }

        // 4. Supprimer logiquement tous les plats de cette catégorie
        // (Note : nécessite d'adapter dishRepository pour traiter un tableau d'IDs ou boucler)
        for (const dishId of dishIds) {
          await dishRepository.softDelete(dishId, tx);
        }
      }

      // 5. Supprimer logiquement la catégorie
      return categoryRepository.softDelete(id, tx);
    });
  }
}

export default new CategoryService();
