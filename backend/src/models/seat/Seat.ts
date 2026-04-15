import { SeatType } from "../../generated/prisma/client.js";

export abstract class Seat {
  constructor(
    public readonly id: string,
    public readonly rowLabel: string,
    public readonly seatNumber: number,
    public readonly type: SeatType,
    public readonly priceMultiplier: number
  ) {}

  abstract calculatePrice(basePrice: number): number;

  getLabel(): string {
    return `${this.rowLabel}${this.seatNumber}`;
  }
}
