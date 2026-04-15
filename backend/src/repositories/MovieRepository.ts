import prisma from "../config/db.js";
import { Movie } from "../generated/prisma/client.js";

export class MovieRepository {
  async findAll(): Promise<Movie[]> {
    return prisma.movie.findMany({ orderBy: { releaseDate: "desc" } });
  }

  async findById(id: string): Promise<Movie | null> {
    return prisma.movie.findUnique({ where: { id } });
  }

  async create(data: {
    title: string;
    genre: string;
    durationMinutes: number;
    language: string;
    rating: string;
    posterUrl: string;
    releaseDate: Date;
  }): Promise<Movie> {
    return prisma.movie.create({ data });
  }

  async update(id: string, data: Partial<{
    title: string;
    genre: string;
    durationMinutes: number;
    language: string;
    rating: string;
    posterUrl: string;
    releaseDate: Date;
  }>): Promise<Movie> {
    return prisma.movie.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Movie> {
    return prisma.movie.delete({ where: { id } });
  }
}

export const movieRepository = new MovieRepository();
