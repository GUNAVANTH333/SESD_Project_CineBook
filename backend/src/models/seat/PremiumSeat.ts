import { SeatType } from "../../generated/prisma/client.js";
import { Seat } from "./Seat.js";

export class PremiumSeat extends Seat {
  constructor(id: string, rowLabel: string, seatNumber: number) {
    super(id, rowLabel, seatNumber, SeatType.PREMIUM, 1.5);
  }

  calculatePrice(basePrice: number): number {
    return parseFloat((basePrice * this.priceMultiplier).toFixed(2));
  }
}
