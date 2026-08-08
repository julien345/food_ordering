// src/modules/category/category.service.ts
import categoryRepository  from "./category.repository";

export class CategoryService {
  async getAll() {
    return categoryRepository.findAll();
  }

  async getById(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new Error("CATEGORY_NOT_FOUND");
    return category;
  }

  async create(data: { name: string; imageUrl?: string }) {
    const existing = await categoryRepository.findByName(data.name);
    if (existing) throw new Error("CATEGORY_ALREADY_EXISTS");
    return categoryRepository.create(data);
  }

  async update(id: string, data: { name?: string; imageUrl?: string }) {
    await this.getById(id);
    return categoryRepository.update(id, data);
  }

  async remove(id: string) {
    await this.getById(id);
    return categoryRepository.softDelete(id);
  }
}

export default new CategoryService();