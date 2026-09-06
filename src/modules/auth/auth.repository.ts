// src/modules/auth/auth.repository.ts
import  prisma  from "../../config/prisma";
import { RegisterInput} from "../../validators/auth.validator";

class AuthRepository {

  // find email by ID
  findByEmail(email: string) {
    return prisma.user.findFirst({ where: { email, deletedAt: null } });
  }

  phoneAlreadyExists(phone: string) {
    return prisma.user.findFirst({ where: { phone, deletedAt: null } });
  }

  // find user by id
   findById(id: string) {
    return prisma.user.findFirst({ where: { id, deletedAt: null } });
  }

  //create user with cart 
   createUserWithCart(data: RegisterInput) {
    return prisma.user.create({
      data: {
        ...data,
        cart: { create: {} }, // création auto du panier
      },
      include: { cart: true },
    });
  }

};
export default new AuthRepository();