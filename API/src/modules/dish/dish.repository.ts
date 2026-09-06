// src/modules/dish/dish.repository.ts
import prisma from "../../config/prisma";

type PrismaClientExecutor = Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

class DishRepository {
  private getClient(tx?: PrismaClientExecutor) {
    return tx || prisma;
  }

  findAll(tx?: PrismaClientExecutor) {
    return this.getClient(tx).dish.findMany({
      where: { deletedAt: null },
      include: { category: true },
    });
  }

  // ✅ CORRIGÉ : Accepte maintenant 'tx' pour ne pas bloquer la transaction
  findById(id: string, tx?: PrismaClientExecutor) {
    return this.getClient(tx).dish.findFirst({
      where: { id, deletedAt: null },
      include: { category: true },
    });
  }

  findByCategory(categoryId: string, tx?: PrismaClientExecutor) {
    return this.getClient(tx).dish.findMany({
      where: { categoryId, deletedAt: null },
    });
  }

  findManyByIds(ids: string[], tx?: PrismaClientExecutor) {
    return this.getClient(tx).dish.findMany({
      where: { id: { in: ids }, deletedAt: null },
    });
  }

  findAllPaginated(skip: number, take: number) {
    return prisma.$transaction([
      prisma.dish.findMany({
        where: { deletedAt: null },
        include: { category: true },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.dish.count({ where: { deletedAt: null } }),
    ]).then(([data, total]) => ({ data, total }));
  }

  create(data: {
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    categoryId: string;
    isAvailable?: boolean;
  }, tx?: PrismaClientExecutor) {
    return this.getClient(tx).dish.create({ data });
  }

  update(
    id: string,
    data: { name?: string; description?: string; price?: number; imageUrl?: string; categoryId?: string; isAvailable?: boolean },
    tx?: PrismaClientExecutor
  ) {
    return this.getClient(tx).dish.update({ where: { id }, data });
  }

  softDelete(id: string, tx?: PrismaClientExecutor) {
    return this.getClient(tx).dish.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

export default new DishRepository();
