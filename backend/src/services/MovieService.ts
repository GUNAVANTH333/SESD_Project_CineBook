import { movieRepository } from "../repositories/MovieRepository.js";
import { Movie } from "../generated/prisma/client.js";
import { NotFoundError } from "../utils/AppError.js";

interface CreateMovieDto {
  title: string;
  genre: string;
  durationMinutes: number;
  language: string;
  rating: string;
  posterUrl: string;
  releaseDate: string | Date;
}

export class MovieService {
  async getAll(): Promise<Movie[]> {
    return movieRepository.findAll();
  }

  async getById(id: string): Promise<Movie> {
    const movie = await movieRepository.findById(id);
    if (!movie) throw new NotFoundError("Movie");
    return movie;
  }

  async create(dto: CreateMovieDto): Promise<Movie> {
    return movieRepository.create({
      ...dto,
      releaseDate: new Date(dto.releaseDate),
    });
  }

  async update(id: string, dto: Partial<CreateMovieDto>): Promise<Movie> {
    await this.getById(id);
    const { releaseDate, ...rest } = dto;
    return movieRepository.update(id, {
      ...rest,
      ...(releaseDate ? { releaseDate: new Date(releaseDate) } : {}),
    });
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await movieRepository.delete(id);
  }
}

export const movieService = new MovieService();
