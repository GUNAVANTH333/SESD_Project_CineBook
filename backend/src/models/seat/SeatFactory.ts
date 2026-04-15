import { SeatType } from "../../generated/prisma/client.js";
import { Seat } from "./Seat.js";
import { StandardSeat } from "./StandardSeat.js";
import { PremiumSeat } from "./PremiumSeat.js";
import { ReclinerSeat } from "./ReclinerSeat.js";

export class SeatFactory {
  static create(
    id: string,
    rowLabel: string,
    seatNumber: number,
    type: SeatType
  ): Seat {
    switch (type) {
      case SeatType.STANDARD:
        return new StandardSeat(id, rowLabel, seatNumber);
      case SeatType.PREMIUM:
        return new PremiumSeat(id, rowLabel, seatNumber);
      case SeatType.RECLINER:
        return new ReclinerSeat(id, rowLabel, seatNumber);
      default:
        return new StandardSeat(id, rowLabel, seatNumber);
    }
  }
}
