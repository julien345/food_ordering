// src/modules/category/category.repository.ts
import prisma from "../../config/prisma";

// Type pour autoriser l'utilisation du client Prisma global OU d'une instance de transaction tx
type PrismaClientExecutor = Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

class CategoryRepository {
  // Méthode utilitaire interne pour choisir automatiquement le bon client (tx ou prisma)
  private getClient(tx?: PrismaClientExecutor) {
    return tx || prisma;
  }

  findAll(tx?: PrismaClientExecutor) {
    return this.getClient(tx).category.findMany({ where: { deletedAt: null } });
  }

  // ✅ MIS À JOUR : Accepte désormais 'tx' pour ne pas bloquer les transactions du DishService
  findById(id: string, tx?: PrismaClientExecutor) {
    return this.getClient(tx).category.findFirst({ where: { id, deletedAt: null } });
  }

  findByName(name: string, tx?: PrismaClientExecutor) {
    return this.getClient(tx).category.findFirst({ where: { name, deletedAt: null } });
  }

  create(data: { name: string; imageUrl?: string }, tx?: PrismaClientExecutor) {
    return this.getClient(tx).category.create({ data });
  }

  update(id: string, data: { name?: string; imageUrl?: string }, tx?: PrismaClientExecutor) {
    return this.getClient(tx).category.update({ where: { id }, data });
  }

  softDelete(id: string, tx?: PrismaClientExecutor) {
    return this.getClient(tx).category.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

export default new CategoryRepository();
