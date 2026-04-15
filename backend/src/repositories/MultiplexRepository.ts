import prisma from "../config/db.js";
import { Multiplex, Screen } from "../generated/prisma/client.js";

export class MultiplexRepository {
  async findAll(): Promise<(Multiplex & { screens: Screen[] })[]> {
    return prisma.multiplex.findMany({
      include: { screens: true },
      orderBy: { name: "asc" },
    });
  }

  async findById(id: string): Promise<(Multiplex & { screens: Screen[] }) | null> {
    return prisma.multiplex.findUnique({
      where: { id },
      include: { screens: true },
    });
  }

  async create(data: {
    name: string;
    location: string;
    city: string;
    totalScreens: number;
  }): Promise<Multiplex> {
    return prisma.multiplex.create({ data });
  }

  async update(id: string, data: Partial<{
    name: string;
    location: string;
    city: string;
    totalScreens: number;
  }>): Promise<Multiplex> {
    return prisma.multiplex.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Multiplex> {
    return prisma.multiplex.delete({ where: { id } });
  }

  async addScreen(data: {
    multiplexId: string;
    screenNumber: number;
    totalRows: number;
    totalColumns: number;
    capacity: number;
  }): Promise<Screen> {
    return prisma.screen.create({ data });
  }
}

export const multiplexRepository = new MultiplexRepository();
