import categoryRepository from "./category.repository";
import { NotFoundError, ConflictError } from "../../errors";

class CategoryService {
  async getAll() {
    return categoryRepository.findAll();
  }

  async getById(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError("Catégorie introuvable.");
    return category;
  }

  async create(data: { name: string; imageUrl?: string }) {
    const existing = await categoryRepository.findByName(data.name);
    if (existing) throw new ConflictError("Cette catégorie existe déjà.");
    return categoryRepository.create(data);
  }

  async update(id: string, data: { name?: string; imageUrl?: string }) {
    await this.getById(id);

    if (data.name) {
      const existing = await categoryRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new ConflictError("Une autre catégorie porte déjà ce nom.");
      }
    }

    return categoryRepository.update(id, data);
  }

  async remove(id: string) {
    await this.getById(id);
    return categoryRepository.softDelete(id);
  }
}

export default new CategoryService();