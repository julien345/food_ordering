// src/modules/dish/dish.service.ts
import dishRepository from "./dish.repository";
import categoryRepository from "../category/category.repository";

class DishService {
  async getAll() {
    return dishRepository.findAll();
  }

  async getById(id: string) {
    const dish = await dishRepository.findById(id);
    if (!dish) throw new Error("DISH_NOT_FOUND");
    return dish;
  }

  async getByCategory(categoryId: string) {
    const category = await categoryRepository.findById(categoryId);
    if (!category) throw new Error("CATEGORY_NOT_FOUND");
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
    if (!category) throw new Error("CATEGORY_NOT_FOUND");
    return dishRepository.create(data);
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      imageUrl?: string;
      categoryId?: string;
      isAvailable?: boolean;
    }
  ) {
    await this.getById(id);
    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId);
      if (!category) throw new Error("CATEGORY_NOT_FOUND");
    }
    return dishRepository.update(id, data);
  }

  async remove(id: string) {
    await this.getById(id);
    return dishRepository.softDelete(id);
  }
}

export default new DishService();