// src/modules/user/user.service.ts
import bcrypt from "bcrypt";
import userRepository from "./user.repository";
import authRepository from "../auth/auth.repository";
import { Role } from "../../generated/prisma/client";
import { NotFoundError, ConflictError } from "../../errors";
import { parsePaginationParams, buildPaginatedResult, PaginationParams } from "../../utils/pagination";
import { CreateUserByAdminInput } from "../../validators/user.validator";

class UserService {
  async getAllPaginated(params: PaginationParams, role?: Role) {
    const skip = (params.page - 1) * params.limit;
    const { data, total } = await userRepository.findAllPaginated(skip, params.limit, role);
    return buildPaginatedResult(data, total, params);
  }

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError("Utilisateur introuvable.");
    return user;
  }

  async createByAdmin(input: CreateUserByAdminInput) {
    const existingEmail = await authRepository.findByEmail(input.email);
    if (existingEmail) throw new ConflictError("Cet email est déjà utilisé.");

    if (input.phone) {
      const existingPhone = await authRepository.phoneAlreadyExists(input.phone);
      if (existingPhone) throw new ConflictError("Ce numéro de téléphone est déjà utilisé.");
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    return userRepository.createWithRole({
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: input.role,
    });
  }

  async updateRole(id: string, role: Role) {
    await this.getById(id); // vérifie l'existence, lève NotFoundError sinon
    return userRepository.updateRole(id, role);
  }

  async remove(id: string) {
    await this.getById(id);
    return userRepository.softDelete(id);
  }
}

export default new UserService();