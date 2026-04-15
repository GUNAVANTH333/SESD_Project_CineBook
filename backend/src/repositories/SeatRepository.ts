import prisma from "../config/db.js";
import { Seat, ShowSeat, ShowSeatStatus } from "../generated/prisma/client.js";

export class SeatRepository {
  async findByScreen(screenId: string): Promise<Seat[]> {
    return prisma.seat.findMany({
      where: { screenId },
      orderBy: [{ rowLabel: "asc" }, { seatNumber: "asc" }],
    });
  }

  async findShowSeats(showId: string): Promise<(ShowSeat & { seat: Seat })[]> {
    return prisma.showSeat.findMany({
      where: { showId },
      include: { seat: true },
      orderBy: [
        { seat: { rowLabel: "asc" } },
        { seat: { seatNumber: "asc" } },
      ],
    });
  }

  async createSeatsForScreen(
    screenId: string,
    seats: Array<{
      rowLabel: string;
      seatNumber: number;
      seatType: "STANDARD" | "PREMIUM" | "RECLINER";
      priceMultiplier: number;
    }>
  ): Promise<void> {
    await prisma.seat.createMany({
      data: seats.map((s) => ({ ...s, screenId })),
      skipDuplicates: true,
    });
  }

  async initShowSeats(showId: string, seatIds: string[]): Promise<void> {
    await prisma.showSeat.createMany({
      data: seatIds.map((seatId) => ({ showId, seatId })),
      skipDuplicates: true,
    });
  }

  async findShowSeatsByIds(
    showSeatIds: string[]
  ): Promise<(ShowSeat & { seat: Seat })[]> {
    return prisma.showSeat.findMany({
      where: { id: { in: showSeatIds } },
      include: { seat: true },
    });
  }

  async releaseExpiredLocks(): Promise<number> {
    const result = await prisma.showSeat.updateMany({
      where: {
        status: ShowSeatStatus.LOCKED,
        lockExpiresAt: { lt: new Date() },
      },
      data: {
        status: ShowSeatStatus.AVAILABLE,
        lockedByBookingId: null,
        lockExpiresAt: null,
      },
    });
    return result.count;
  }
}

export const seatRepository = new SeatRepository();
