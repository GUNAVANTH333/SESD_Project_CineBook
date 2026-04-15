import { seatRepository } from "../repositories/SeatRepository.js";
import { showRepository } from "../repositories/ShowRepository.js";
import { SeatFactory } from "../models/seat/SeatFactory.js";
import { NotFoundError } from "../utils/AppError.js";
import { ShowSeat, Seat, ShowSeatStatus } from "../generated/prisma/client.js";

interface SeatMapEntry {
  showSeatId: string;
  seatId: string;
  label: string;
  row: string;
  number: number;
  type: string;
  status: ShowSeatStatus;
  price: number;
}

export class SeatService {
  async getSeatMapForShow(showId: string): Promise<SeatMapEntry[]> {
    const show = await showRepository.findById(showId);
    if (!show) throw new NotFoundError("Show");

    const showSeats = await seatRepository.findShowSeats(showId);

    return showSeats.map((ss: ShowSeat & { seat: Seat }) => {
      const domainSeat = SeatFactory.create(
        ss.seat.id,
        ss.seat.rowLabel,
        ss.seat.seatNumber,
        ss.seat.seatType
      );

      return {
        showSeatId: ss.id,
        seatId: ss.seat.id,
        label: domainSeat.getLabel(),
        row: ss.seat.rowLabel,
        number: ss.seat.seatNumber,
        type: ss.seat.seatType,
        status: ss.status,
        price: domainSeat.calculatePrice((show as any).basePrice),
      };
    });
  }

  async addSeatsToScreen(
    screenId: string,
    seats: Array<{
      rowLabel: string;
      seatNumber: number;
      seatType: "STANDARD" | "PREMIUM" | "RECLINER";
      priceMultiplier: number;
    }>
  ): Promise<void> {
    await seatRepository.createSeatsForScreen(screenId, seats);
  }

  async releaseExpiredLocks(): Promise<number> {
    return seatRepository.releaseExpiredLocks();
  }
}

export const seatService = new SeatService();
