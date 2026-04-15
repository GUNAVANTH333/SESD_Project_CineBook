import { Router } from "express";
import { z } from "zod";
import { multiplexController } from "../controllers/MultiplexController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateRequest.js";

const router = Router();

const createMultiplexSchema = z.object({
  name: z.string().min(1).max(200),
  location: z.string().min(1),
  city: z.string().min(1),
  totalScreens: z.number().int().positive(),
});

const addScreenSchema = z.object({
  screenNumber: z.number().int().positive(),
  totalRows: z.number().int().positive(),
  totalColumns: z.number().int().positive(),
  capacity: z.number().int().positive(),
});

router.get("/", (req, res, next) => multiplexController.getAll(req, res, next));
router.get("/:id", (req, res, next) => multiplexController.getById(req, res, next));
router.post("/", authenticate, authorize("ADMIN"), validate(createMultiplexSchema), (req, res, next) => multiplexController.create(req, res, next));
router.patch("/:id", authenticate, authorize("ADMIN"), validate(createMultiplexSchema.partial()), (req, res, next) => multiplexController.update(req, res, next));
router.delete("/:id", authenticate, authorize("ADMIN"), (req, res, next) => multiplexController.delete(req, res, next));
router.post("/:id/screens", authenticate, authorize("ADMIN"), validate(addScreenSchema), (req, res, next) => multiplexController.addScreen(req, res, next));

export default router;
