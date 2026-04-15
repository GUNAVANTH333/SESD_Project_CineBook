import { showRepository } from "../repositories/ShowRepository.js";
import { movieRepository } from "../repositories/MovieRepository.js";
import { multiplexRepository } from "../repositories/MultiplexRepository.js";
import { seatRepository } from "../repositories/SeatRepository.js";
import { Show } from "../generated/prisma/client.js";
import { NotFoundError, ConflictError } from "../utils/AppError.js";

interface CreateShowDto {
  movieId: string;
  screenId: string;
  showTime: string | Date;
  basePrice: number;
}

export class ShowService {
  async getAll(filters: { movieId?: string; city?: string }): Promise<Show[]> {
    return showRepository.findAll(filters);
  }

  async getById(id: string): Promise<Show> {
    const show = await showRepository.findById(id);
    if (!show) throw new NotFoundError("Show");
    return show;
  }

  async create(dto: CreateShowDto): Promise<Show> {
    const movie = await movieRepository.findById(dto.movieId);
    if (!movie) throw new NotFoundError("Movie");

    const showTime = new Date(dto.showTime);
    const endTime = new Date(
      showTime.getTime() + movie.durationMinutes * 60 * 1000
    );

    const hasOverlap = await showRepository.hasOverlap(
      dto.screenId,
      showTime,
      endTime
    );
    if (hasOverlap) {
      throw new ConflictError("Screen is already booked during this time slot");
    }

    const show = await showRepository.create({
      movieId: dto.movieId,
      screenId: dto.screenId,
      showTime,
      endTime,
      basePrice: dto.basePrice,
    });

    // Initialize show seats from screen seats
    const seats = await seatRepository.findByScreen(dto.screenId);
    if (seats.length > 0) {
      await seatRepository.initShowSeats(
        show.id,
        seats.map((s) => s.id)
      );
    }

    return show;
  }
}

export const showService = new ShowService();
