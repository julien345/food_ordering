import bcrypt from "bcrypt";
import authRepository from "./auth.repository";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { ConflictError, UnauthorizedError, NotFoundError } from "../../errors";

class AuthService {
  async register(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) throw new ConflictError("Cet email est déjà utilisé.");

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await authRepository.createUserWithCart({
      ...input,
      password: hashedPassword,
    });

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

    return {
      user: { id: user.id, email: user.email, firstName: user.firstName, role: user.role },
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    const user = await authRepository.findByEmail(email);
    if (!user) throw new UnauthorizedError("Email ou mot de passe incorrect.");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new UnauthorizedError("Email ou mot de passe incorrect.");

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

    return {
      user: { id: user.id, email: user.email, firstName: user.firstName, role: user.role },
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Refresh token invalide ou expiré.");
    }

    const user = await authRepository.findById(payload.userId);
    if (!user) throw new UnauthorizedError("Refresh token invalide ou expiré.");

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user.id, role: user.role });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async getProfile(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) throw new NotFoundError("Utilisateur introuvable.");

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      role: user.role,
    };
  }
}

export default new AuthService();