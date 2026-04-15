import { SeatType } from "../../generated/prisma/client.js";
import { Seat } from "./Seat.js";

export class StandardSeat extends Seat {
  constructor(id: string, rowLabel: string, seatNumber: number) {
    super(id, rowLabel, seatNumber, SeatType.STANDARD, 1.0);
  }

  calculatePrice(basePrice: number): number {
    return parseFloat((basePrice * this.priceMultiplier).toFixed(2));
  }
}
