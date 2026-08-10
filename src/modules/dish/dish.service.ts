import dishRepository from "./dish.repository";
import categoryRepository from "../category/category.repository";
import { NotFoundError } from "../../errors";
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

  async getById(id: string) {
    const dish = await dishRepository.findById(id);
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
      if (!category) throw new NotFoundError("Catégorie introuvable.");
    }
    return dishRepository.update(id, data);
  }

  async remove(id: string) {
    await this.getById(id);
    return dishRepository.softDelete(id);
  }
}

export default new DishService();