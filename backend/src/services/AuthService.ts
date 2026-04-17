import { userRepository } from "../repositories/UserRepository.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/token.js";
import { ConflictError, UnauthorizedError, NotFoundError } from "../utils/AppError.js";
import { User } from "../generated/prisma/client.js";
import { env } from "../config/env.js";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  adminKey?: string;
}

interface LoginDto {
  email: string;
  password: string;
}

type SafeUser = Omit<User, "passwordHash">;

export class AuthService {
  async register(dto: RegisterDto): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    const existing = await userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const passwordHash = await hashPassword(dto.password);
    const role = dto.adminKey === env.ADMIN_REGISTRATION_KEY ? "ADMIN" : "CUSTOMER";

    const user = await userRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      phone: dto.phone,
      role,
    });

    const tokens = this.issueTokens(user);
    const { passwordHash: _, ...safeUser } = user;

    return { user: safeUser, tokens };
  }

  async login(dto: LoginDto): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    const user = await userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await comparePassword(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const tokens = this.issueTokens(user);
    const { passwordHash: _, ...safeUser } = user;

    return { user: safeUser, tokens };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await userRepository.findById(payload.userId);
    if (!user) throw new NotFoundError("User");

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    return { accessToken };
  }

  private issueTokens(user: User): AuthTokens {
    const payload = { userId: user.id, role: user.role };
    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }
}

export const authService = new AuthService();
