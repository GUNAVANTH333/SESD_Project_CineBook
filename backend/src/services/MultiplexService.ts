import { multiplexRepository } from "../repositories/MultiplexRepository.js";
import { Multiplex, Screen } from "../generated/prisma/client.js";
import { NotFoundError } from "../utils/AppError.js";

interface CreateMultiplexDto {
  name: string;
  location: string;
  city: string;
  totalScreens: number;
}

interface AddScreenDto {
  screenNumber: number;
  totalRows: number;
  totalColumns: number;
  capacity: number;
}

export class MultiplexService {
  async getAll(): Promise<(Multiplex & { screens: Screen[] })[]> {
    return multiplexRepository.findAll();
  }

  async getById(id: string): Promise<Multiplex & { screens: Screen[] }> {
    const multiplex = await multiplexRepository.findById(id);
    if (!multiplex) throw new NotFoundError("Multiplex");
    return multiplex;
  }

  async create(dto: CreateMultiplexDto): Promise<Multiplex> {
    return multiplexRepository.create(dto);
  }

  async update(id: string, dto: Partial<CreateMultiplexDto>): Promise<Multiplex> {
    await this.getById(id);
    return multiplexRepository.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await multiplexRepository.delete(id);
  }

  async addScreen(multiplexId: string, dto: AddScreenDto): Promise<Screen> {
    await this.getById(multiplexId);
    return multiplexRepository.addScreen({ multiplexId, ...dto });
  }
}

export const multiplexService = new MultiplexService();
