import { Router } from "express";
import { z } from "zod";
import { authController } from "../controllers/AuthController.js";
import { validate } from "../middlewares/validateRequest.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  phone: z.string().optional(),
  adminKey: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

router.post("/register", validate(registerSchema), (req, res, next) => authController.register(req, res, next));
router.post("/login", validate(loginSchema), (req, res, next) => authController.login(req, res, next));
router.post("/refresh", validate(refreshSchema), (req, res, next) => authController.refresh(req, res, next));

export default router;
