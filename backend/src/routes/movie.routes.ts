import { Router } from "express";
import { z } from "zod";
import { movieController } from "../controllers/MovieController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateRequest.js";

const router = Router();

const createMovieSchema = z.object({
  title: z.string().min(1).max(200),
  genre: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  language: z.string().min(1),
  rating: z.string().min(1),
  posterUrl: z.string().url(),
  releaseDate: z.string().datetime(),
});

const updateMovieSchema = createMovieSchema.partial();

router.get("/", (req, res, next) => movieController.getAll(req, res, next));
router.get("/:id", (req, res, next) => movieController.getById(req, res, next));
router.post("/", authenticate, authorize("ADMIN"), validate(createMovieSchema), (req, res, next) => movieController.create(req, res, next));
router.patch("/:id", authenticate, authorize("ADMIN"), validate(updateMovieSchema), (req, res, next) => movieController.update(req, res, next));
router.delete("/:id", authenticate, authorize("ADMIN"), (req, res, next) => movieController.delete(req, res, next));

export default router;
