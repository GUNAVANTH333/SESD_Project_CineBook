import { bookingRepository } from "../repositories/BookingRepository.js";
import { seatRepository } from "../repositories/SeatRepository.js";
import { showRepository } from "../repositories/ShowRepository.js";
import { BookingStateMachine } from "../models/booking/BookingStateMachine.js";
import { SeatFactory } from "../models/seat/SeatFactory.js";
import { NotFoundError, BadRequestError, ForbiddenError } from "../utils/AppError.js";
import { Booking, BookingStatus, ShowSeatStatus } from "../generated/prisma/client.js";

interface CreateBookingDto {
  showId: string;
  showSeatIds: string[];
}

export class BookingService {
  async createBooking(userId: string, dto: CreateBookingDto): Promise<Booking> {
    const show = await showRepository.findById(dto.showId);
    if (!show) throw new NotFoundError("Show");

    if (new Date() >= (show as any).showTime) {
      throw new BadRequestError("Cannot book seats for a show that has already started");
    }

    if (dto.showSeatIds.length === 0) {
      throw new BadRequestError("At least one seat must be selected");
    }

    if (dto.showSeatIds.length > 10) {
      throw new BadRequestError("Cannot book more than 10 seats at once");
    }

    // Fetch show seats and validate availability
    const showSeats = await seatRepository.findShowSeatsByIds(dto.showSeatIds);

    if (showSeats.length !== dto.showSeatIds.length) {
      throw new BadRequestError("One or more seats not found for this show");
    }

    for (const ss of showSeats) {
      if (ss.showId !== dto.showId) {
        throw new BadRequestError("Seat does not belong to this show");
      }
      if (ss.status !== ShowSeatStatus.AVAILABLE) {
        throw new BadRequestError(
          `Seat ${ss.seat.rowLabel}${ss.seat.seatNumber} is not available`
        );
      }
    }

    // Calculate price using domain seat models
    const seatPrices = showSeats.map((ss) => {
      const domainSeat = SeatFactory.create(
        ss.seat.id,
        ss.seat.rowLabel,
        ss.seat.seatNumber,
        ss.seat.seatType
      );
      return {
        showSeatId: ss.id,
        price: domainSeat.calculatePrice((show as any).basePrice),
      };
    });

    return bookingRepository.createWithSeats(
      userId,
      dto.showId,
      dto.showSeatIds,
      seatPrices
    );
  }

  async getMyBookings(userId: string): Promise<Booking[]> {
    return bookingRepository.findByUser(userId);
  }

  async getBookingById(id: string, userId: string, role: string): Promise<Booking> {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new NotFoundError("Booking");

    if (role !== "ADMIN" && (booking as any).userId !== userId) {
      throw new ForbiddenError();
    }

    return booking;
  }

  async cancelBooking(id: string, userId: string, role: string): Promise<Booking> {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new NotFoundError("Booking");

    if (role !== "ADMIN" && (booking as any).userId !== userId) {
      throw new ForbiddenError();
    }

    const machine = new BookingStateMachine((booking as any).status);
    machine.transition(BookingStatus.CANCELLED);

    await bookingRepository.releaseSeats(id);

    return bookingRepository.updateStatus(
      id,
      BookingStatus.CANCELLED,
      userId,
      (booking as any).status
    );
  }
}

export const bookingService = new BookingService();
