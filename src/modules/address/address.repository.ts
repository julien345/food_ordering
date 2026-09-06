// src/modules/address/address.repository.ts
import prisma from "../../config/prisma";

class AddressRepository {
  findAllByUser(userId: string) {
    return prisma.address.findMany({
      where: { userId, deletedAt: null },
      orderBy: { isDefault: "desc" },
    });
  }

  findById(id: string) {
    return prisma.address.findFirst({ where: { id, deletedAt: null } });
  }

  create(
    userId: string,
    data: {
      label: string;
      street: string;
      city: string;
      latitude?: number;
      longitude?: number;
      isDefault?: boolean;
    }
  ) {
    return prisma.address.create({ data: { ...data, userId } });
  }

  update(
    id: string,
    data: {
      label?: string;
      street?: string;
      city?: string;
      latitude?: number;
      longitude?: number;
      isDefault?: boolean;
    }
  ) {
    return prisma.address.update({ where: { id }, data });
  }

  softDelete(id: string) {
    return prisma.address.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  unsetDefaultForUser(userId: string) {
    return prisma.address.updateMany({
      where: { userId, isDefault: true, deletedAt: null },
      data: { isDefault: false },
    });
  }
}

export default new AddressRepository();