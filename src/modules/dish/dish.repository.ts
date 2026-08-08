import prisma from "../../config/prisma";

class DishRepository {
  findAll() {
    return prisma.dish.findMany({
      where: { deletedAt: null },
      include: { category: true },
    });
  }

  findById(id: string) {
    return prisma.dish.findFirst({
      where: { id, deletedAt: null },
      include: { category: true },
    });
  }

  findByCategory(categoryId: string) {
    return prisma.dish.findMany({
      where: { categoryId, deletedAt: null },
    });
  }

  create(data: {
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    categoryId: string;
  }) {
    return prisma.dish.create({ data });
  }

  update(
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
    return prisma.dish.update({ where: { id }, data });
  }

  softDelete(id: string) {
    return prisma.dish.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

export default new DishRepository();
