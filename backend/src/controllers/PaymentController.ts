import { Request, Response, NextFunction } from "express";
import { paymentService } from "../services/PaymentService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export class PaymentController {
  async pay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payment = await paymentService.pay(
        req.params["bookingId"] as string,
        req.user!.userId,
        req.body
      );
      sendSuccess(res, payment, "Payment processed");
    } catch (err) {
      next(err);
    }
  }
}

export const paymentController = new PaymentController();
