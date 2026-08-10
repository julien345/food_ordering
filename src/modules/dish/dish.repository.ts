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

  findManyByIds(ids: string[]) {
    return prisma.dish.findMany({
      where: { id: { in: ids }, deletedAt: null },
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

  async findAllPaginated(skip: number, take: number) {
    const [data, total] = await prisma.$transaction([
      prisma.dish.findMany({
        where: { deletedAt: null },
        include: { category: true },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.dish.count({ where: { deletedAt: null } }),
    ]);

    return { data, total };
  }
}

export default new DishRepository();