// src/modules/user/user.repository.ts
import prisma from "../../config/prisma";
import { Role } from "../../generated/prisma/client";

class UserRepository {
  findAllPaginated(skip: number, take: number, role?: Role) {
    const where = { deletedAt: null, ...(role ? { role } : {}) };

    return prisma.$transaction([
      prisma.user.findMany({
        where,
        select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, createdAt: true },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]).then(([data, total]) => ({ data, total }));
  }

  findById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, createdAt: true },
    });
  }

  createWithRole(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: Role;
  }) {
    return prisma.user.create({
      data: {
        ...data,
        // Crée un panier UNIQUEMENT si par hasard le rôle est CLIENT
        ...(data.role === ("CLIENT" as Role) ? { cart: { create: {} } } : {}),
      },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, createdAt: true },
    });
  }

  updateRole(id: string, role: Role) {
    return prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, createdAt: true },
    });
  }

  softDelete(id: string) {
    return prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

export default new UserRepository();