import prisma from "../config/db.js";
import { Payment, PaymentStatus } from "../generated/prisma/client.js";

export class PaymentRepository {
  async findByBookingId(bookingId: string): Promise<Payment | null> {
    return prisma.payment.findUnique({ where: { bookingId } });
  }

  async create(data: {
    bookingId: string;
    amount: number;
    transactionId: string;
    paymentMethod: string;
    status: PaymentStatus;
    paidAt?: Date;
  }): Promise<Payment> {
    return prisma.payment.create({ data });
  }

  async updateStatus(
    bookingId: string,
    status: PaymentStatus,
    paidAt?: Date
  ): Promise<Payment> {
    return prisma.payment.update({
      where: { bookingId },
      data: { status, ...(paidAt ? { paidAt } : {}) },
    });
  }
}

export const paymentRepository = new PaymentRepository();
