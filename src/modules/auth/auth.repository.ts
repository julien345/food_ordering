import prisma from "../../config/prisma";
import { RegisterInput } from "../../validators/auth.validator";

class AuthRepository {
  findByEmail(email: string) {
    return prisma.user.findFirst({ where: { email, deletedAt: null } });
  }

  findById(id: string) {
    return prisma.user.findFirst({ where: { id, deletedAt: null } });
  }

  phoneAlreadyExists(phone: string) {
    return prisma.user.findFirst({ where: { phone, deletedAt: null } });
  }

  createUserWithCart(data: RegisterInput) {
    return prisma.user.create({
      data: {
        ...data,
        cart: { create: {} },
      },
      include: { cart: true },
    });
  }
}

export default new AuthRepository();