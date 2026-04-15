import { Router } from "express";
import { z } from "zod";
import { bookingController } from "../controllers/BookingController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateRequest.js";

const router = Router();

const createBookingSchema = z.object({
  showId: z.string().uuid(),
  showSeatIds: z.array(z.string().uuid()).min(1).max(10),
});

router.use(authenticate);

router.post("/", authorize("CUSTOMER"), validate(createBookingSchema), (req, res, next) => bookingController.create(req, res, next));
router.get("/", (req, res, next) => bookingController.getMyBookings(req, res, next));
router.get("/:id", (req, res, next) => bookingController.getById(req, res, next));
router.post("/:id/cancel", (req, res, next) => bookingController.cancel(req, res, next));

export default router;
