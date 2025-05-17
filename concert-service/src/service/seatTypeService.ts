import { ConcertModel } from '../models/Concert';
import { Types } from 'mongoose';

type SeatSummary = {
  type: string;
  total: number;
  booked: number;
  remaining: number;
};

export class SeatTypeService {
  async getSeatTypesByConcertId(concertId: string): Promise<SeatSummary[] | null> {
    if (!Types.ObjectId.isValid(concertId)) return null;

    const concert = await ConcertModel.findById(concertId).lean().exec();
    if (!concert || !concert.seats) return null;

    return concert.seats.map(seat => ({
      type: seat.type,
      total: seat.total,
      booked: seat.booked,
      remaining: seat.total - seat.booked,
    }));
  }
}

export const seatTypeService = new SeatTypeService();
