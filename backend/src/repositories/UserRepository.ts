import prisma from "../config/db.js";
import { User } from "../generated/prisma/client.js";

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    phone?: string;
  }): Promise<User> {
    return prisma.user.create({ data });
  }
}

export const userRepository = new UserRepository();
