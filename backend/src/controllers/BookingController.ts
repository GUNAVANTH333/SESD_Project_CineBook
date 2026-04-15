import { Request, Response, NextFunction } from "express";
import { bookingService } from "../services/BookingService.js";
import { sendSuccess, sendCreated } from "../utils/apiResponse.js";

export class BookingController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await bookingService.createBooking(req.user!.userId, req.body);
      sendCreated(res, booking, "Booking created successfully");
    } catch (err) {
      next(err);
    }
  }

  async getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookings = await bookingService.getMyBookings(req.user!.userId);
      sendSuccess(res, bookings);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await bookingService.getBookingById(
        req.params["id"] as string,
        req.user!.userId,
        req.user!.role
      );
      sendSuccess(res, booking);
    } catch (err) {
      next(err);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await bookingService.cancelBooking(
        req.params["id"] as string,
        req.user!.userId,
        req.user!.role
      );
      sendSuccess(res, booking, "Booking cancelled successfully");
    } catch (err) {
      next(err);
    }
  }
}

export const bookingController = new BookingController();
