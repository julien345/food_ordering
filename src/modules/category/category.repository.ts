// src/modules/category/category.repository.ts
import prisma from "../../config/prisma";

 class CategoryRepository {
  findAll() {
    return prisma.category.findMany({ where: { deletedAt: null } });
  }

  findById(id: string) {
    return prisma.category.findFirst({ where: { id, deletedAt: null } });
  }

  findByName(name: string) {
    return prisma.category.findFirst({ where: { name, deletedAt: null } });
  }

  create(data: { name: string; imageUrl?: string }) {
    return prisma.category.create({ data });
  }

  update(id: string, data: { name?: string; imageUrl?: string }) {
    return prisma.category.update({ where: { id }, data });
  }

  softDelete(id: string) {
    return prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
  }
  
}

export default new CategoryRepository();