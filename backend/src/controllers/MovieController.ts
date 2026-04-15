import { Request, Response, NextFunction } from "express";
import { movieService } from "../services/MovieService.js";
import { sendSuccess, sendCreated } from "../utils/apiResponse.js";

export class MovieController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const movies = await movieService.getAll();
      sendSuccess(res, movies);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const movie = await movieService.getById(req.params["id"] as string);
      sendSuccess(res, movie);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const movie = await movieService.create(req.body);
      sendCreated(res, movie, "Movie created successfully");
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const movie = await movieService.update(req.params["id"] as string, req.body);
      sendSuccess(res, movie, "Movie updated successfully");
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await movieService.delete(req.params["id"] as string);
      sendSuccess(res, null, "Movie deleted successfully");
    } catch (err) {
      next(err);
    }
  }
}

export const movieController = new MovieController();
