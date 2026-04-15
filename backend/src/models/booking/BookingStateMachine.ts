import { BookingStatus } from "../../generated/prisma/client.js";
import { BadRequestError } from "../../utils/AppError.js";

type Transition = {
  [K in BookingStatus]?: BookingStatus[];
};

const VALID_TRANSITIONS: Transition = {
  [BookingStatus.CREATED]: [BookingStatus.PENDING_PAYMENT, BookingStatus.CANCELLED],
  [BookingStatus.PENDING_PAYMENT]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [BookingStatus.CANCELLED],
  [BookingStatus.CANCELLED]: [],
};

export class BookingStateMachine {
  private currentStatus: BookingStatus;

  constructor(initialStatus: BookingStatus) {
    this.currentStatus = initialStatus;
  }

  get status(): BookingStatus {
    return this.currentStatus;
  }

  transition(to: BookingStatus): void {
    const allowed = VALID_TRANSITIONS[this.currentStatus] ?? [];

    if (!allowed.includes(to)) {
      throw new BadRequestError(
        `Invalid booking transition: ${this.currentStatus} → ${to}`
      );
    }

    this.currentStatus = to;
  }

  canTransitionTo(to: BookingStatus): boolean {
    const allowed = VALID_TRANSITIONS[this.currentStatus] ?? [];
    return allowed.includes(to);
  }
}
