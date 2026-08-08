import bcrypt from "bcrypt";
import  authRepository  from "./auth.repository";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { RegisterInput, LoginInput } from "../../validators/auth.validator";

 class AuthService  {
  //  create user with cart
  async register(input: RegisterInput) {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }
    const phoneExists = input.phone ? await authRepository.phoneAlreadyExists(input.phone) : null;
    if (phoneExists) {
      throw new Error("PHONE_ALREADY_EXISTS");
    }

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
    }
  };

  //  user login
  async login(data:LoginInput) {
    const user = await authRepository.findByEmail(data.email);
    if (!user) throw new Error("INVALID_CREDENTIALS");

    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) throw new Error("INVALID_CREDENTIALS");

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

    return {
      user: { id: user.id, email: user.email, firstName: user.firstName, role: user.role },
      accessToken,
      refreshToken,
    }
  }
  // Refresh Token
  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new Error("INVALID_REFRESH_TOKEN");
    }
    
    const user = await authRepository.findById(payload.userId);
    if (!user) throw new Error("INVALID_REFRESH_TOKEN");

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user.id, role: user.role });

    return { accessToken, refreshToken: newRefreshToken };
  }
  async getProfile(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) throw new Error("USER_NOT_FOUND");

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      role: user.role,
    };
  }
};
export default new AuthService();