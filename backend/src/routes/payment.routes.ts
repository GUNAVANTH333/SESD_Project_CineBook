import { Router } from "express";
import { z } from "zod";
import { paymentController } from "../controllers/PaymentController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateRequest.js";

const router = Router();

const paySchema = z.object({
  paymentMethod: z.enum(["CREDIT_CARD", "DEBIT_CARD", "UPI", "NET_BANKING", "WALLET"]),
});

router.use(authenticate);

router.post("/:bookingId/pay", validate(paySchema), (req, res, next) => paymentController.pay(req, res, next));

export default router;
