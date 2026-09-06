// src/modules/address/address.repository.ts
import prisma from "../../config/prisma";
import { CreateAddressInput, UpdateAddressInput } from "../../validators/address.validator";

type PrismaClientExecutor = Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

class AddressRepository {
  private getClient(tx?: PrismaClientExecutor) {
    return tx || prisma;
  }

  findAllByUser(userId: string) {
    return prisma.address.findMany({
      where: { userId, deletedAt: null },
      orderBy: { isDefault: "desc" },
    });
  }

  findById(id: string) {
    return prisma.address.findFirst({ where: { id, deletedAt: null } });
  }

  findLatestActiveByUser(userId: string, tx?: PrismaClientExecutor) {
    return this.getClient(tx).address.findFirst({
      where: { userId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
    });
  }

  create(userId: string, data: CreateAddressInput, tx?: PrismaClientExecutor) {
    return this.getClient(tx).address.create({ data: { ...data, userId } });
  }

  update(id: string, data: UpdateAddressInput, tx?: PrismaClientExecutor) {
    return this.getClient(tx).address.update({ where: { id }, data });
  }

  softDelete(id: string, tx?: PrismaClientExecutor) {
    return this.getClient(tx).address.update({
      where: { id },
      data: { deletedAt: new Date(), isDefault: false },
    });
  }

  unsetDefaultForUser(userId: string, tx?: PrismaClientExecutor) {
    return this.getClient(tx).address.updateMany({
      where: { userId, isDefault: true, deletedAt: null },
      data: { isDefault: false },
    });
  }
}

export default new AddressRepository();