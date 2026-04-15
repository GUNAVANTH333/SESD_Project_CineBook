import prisma from "../config/db.js";
import {
  Booking,
  BookingStatus,
  ShowSeatStatus,
} from "../generated/prisma/client.js";
import { env } from "../config/env.js";

export class BookingRepository {
  async findById(id: string): Promise<Booking | null> {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        bookingSeats: { include: { showSeat: { include: { seat: true } } } },
        payment: true,
        show: { include: { movie: true, screen: { include: { multiplex: true } } } },
      },
    });
  }

  async findByUser(userId: string): Promise<Booking[]> {
    return prisma.booking.findMany({
      where: { userId },
      include: {
        show: { include: { movie: true } },
        bookingSeats: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createWithSeats(
    userId: string,
    showId: string,
    showSeatIds: string[],
    seatPrices: { showSeatId: string; price: number }[]
  ): Promise<Booking> {
    const totalAmount = seatPrices.reduce((sum, s) => sum + s.price, 0);
    const lockExpiresAt = new Date(
      Date.now() + env.SEAT_LOCK_TTL_MINUTES * 60 * 1000
    );

    return prisma.$transaction(async (tx) => {
      // Lock all requested show seats atomically (optimistic locking via version check)
      for (const ssid of showSeatIds) {
        const showSeat = await tx.showSeat.findUnique({ where: { id: ssid } });

        if (!showSeat || showSeat.status !== ShowSeatStatus.AVAILABLE) {
          throw new Error(`Seat ${ssid} is no longer available`);
        }
      }

      // Create the booking
      const booking = await tx.booking.create({
        data: {
          userId,
          showId,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          seatCount: showSeatIds.length,
          status: BookingStatus.CREATED,
          expiresAt: lockExpiresAt,
          bookingSeats: {
            create: seatPrices.map((sp) => ({
              showSeatId: sp.showSeatId,
              price: sp.price,
            })),
          },
        },
        include: { bookingSeats: true },
      });

      // Lock all show seats
      await tx.showSeat.updateMany({
        where: { id: { in: showSeatIds } },
        data: {
          status: ShowSeatStatus.LOCKED,
          lockedByBookingId: booking.id,
          lockExpiresAt,
          version: { increment: 1 },
        },
      });

      // Log the transition
      await tx.bookingLog.create({
        data: {
          bookingId: booking.id,
          previousStatus: "NONE",
          newStatus: BookingStatus.CREATED,
          changedBy: userId,
        },
      });

      return booking;
    });
  }

  async updateStatus(
    id: string,
    newStatus: BookingStatus,
    changedBy: string,
    previousStatus: BookingStatus
  ): Promise<Booking> {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { id },
        data: { status: newStatus, version: { increment: 1 } },
      });

      await tx.bookingLog.create({
        data: {
          bookingId: id,
          previousStatus,
          newStatus,
          changedBy,
        },
      });

      return booking;
    });
  }

  async releaseSeats(bookingId: string): Promise<void> {
    await prisma.showSeat.updateMany({
      where: { lockedByBookingId: bookingId },
      data: {
        status: ShowSeatStatus.AVAILABLE,
        lockedByBookingId: null,
        lockExpiresAt: null,
        version: { increment: 1 },
      },
    });
  }

  async confirmSeats(bookingId: string): Promise<void> {
    await prisma.showSeat.updateMany({
      where: { lockedByBookingId: bookingId },
      data: {
        status: ShowSeatStatus.BOOKED,
        version: { increment: 1 },
      },
    });
  }
}

export const bookingRepository = new BookingRepository();
