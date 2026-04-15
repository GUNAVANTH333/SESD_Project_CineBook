import { Request, Response, NextFunction } from "express";
import { multiplexService } from "../services/MultiplexService.js";
import { sendSuccess, sendCreated } from "../utils/apiResponse.js";

export class MultiplexController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const multiplexes = await multiplexService.getAll();
      sendSuccess(res, multiplexes);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const multiplex = await multiplexService.getById(req.params["id"] as string);
      sendSuccess(res, multiplex);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const multiplex = await multiplexService.create(req.body);
      sendCreated(res, multiplex, "Multiplex created successfully");
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const multiplex = await multiplexService.update(req.params["id"] as string, req.body);
      sendSuccess(res, multiplex, "Multiplex updated successfully");
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await multiplexService.delete(req.params["id"] as string);
      sendSuccess(res, null, "Multiplex deleted successfully");
    } catch (err) {
      next(err);
    }
  }

  async addScreen(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const screen = await multiplexService.addScreen(req.params["id"] as string, req.body);
      sendCreated(res, screen, "Screen added successfully");
    } catch (err) {
      next(err);
    }
  }
}

export const multiplexController = new MultiplexController();
