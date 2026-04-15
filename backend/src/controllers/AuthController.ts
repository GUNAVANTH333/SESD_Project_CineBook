import { Request, Response, NextFunction } from "express";
import { authService } from "../services/AuthService.js";
import { sendSuccess, sendCreated } from "../utils/apiResponse.js";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      sendCreated(res, result, "Account created successfully");
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, "Login successful");
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      sendSuccess(res, result, "Token refreshed");
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
