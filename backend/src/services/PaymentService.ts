import { bookingRepository } from "../repositories/BookingRepository.js";
import { paymentRepository } from "../repositories/PaymentRepository.js";
import { PaymentGatewayAdapter } from "../adapters/PaymentGatewayAdapter.js";
import { BookingStateMachine } from "../models/booking/BookingStateMachine.js";
import { NotFoundError, BadRequestError } from "../utils/AppError.js";
import { BookingStatus, PaymentStatus, Payment } from "../generated/prisma/client.js";

interface PayDto {
  paymentMethod: string;
}

export class PaymentService {
  private gateway = new PaymentGatewayAdapter();

  async pay(bookingId: string, userId: string, dto: PayDto): Promise<Payment> {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new NotFoundError("Booking");

    if ((booking as any).userId !== userId) {
      throw new BadRequestError("You do not own this booking");
    }

    const machine = new BookingStateMachine((booking as any).status);
    machine.transition(BookingStatus.PENDING_PAYMENT);

    // Check if booking has expired
    const expiresAt: Date | null = (booking as any).expiresAt;
    if (expiresAt && new Date() > expiresAt) {
      await bookingRepository.releaseSeats(bookingId);
      await bookingRepository.updateStatus(
        bookingId,
        BookingStatus.CANCELLED,
        userId,
        (booking as any).status
      );
      throw new BadRequestError("Booking has expired. Please rebook your seats.");
    }

    const existing = await paymentRepository.findByBookingId(bookingId);
    if (existing && existing.status === PaymentStatus.SUCCESS) {
      throw new BadRequestError("Payment already completed for this booking");
    }

    await bookingRepository.updateStatus(
      bookingId,
      BookingStatus.PENDING_PAYMENT,
      userId,
      (booking as any).status
    );

    const result = await this.gateway.charge(
      (booking as any).totalAmount,
      dto.paymentMethod
    );

    if (result.success) {
      const payment = await paymentRepository.create({
        bookingId,
        amount: (booking as any).totalAmount,
        transactionId: result.transactionId,
        paymentMethod: dto.paymentMethod,
        status: PaymentStatus.SUCCESS,
        paidAt: new Date(),
      });

      await bookingRepository.confirmSeats(bookingId);
      await bookingRepository.updateStatus(
        bookingId,
        BookingStatus.CONFIRMED,
        userId,
        BookingStatus.PENDING_PAYMENT
      );

      return payment;
    } else {
      const payment = await paymentRepository.create({
        bookingId,
        amount: (booking as any).totalAmount,
        transactionId: result.transactionId,
        paymentMethod: dto.paymentMethod,
        status: PaymentStatus.FAILED,
      });

      await bookingRepository.releaseSeats(bookingId);
      await bookingRepository.updateStatus(
        bookingId,
        BookingStatus.CANCELLED,
        userId,
        BookingStatus.PENDING_PAYMENT
      );

      return payment;
    }
  }
}

export const paymentService = new PaymentService();
