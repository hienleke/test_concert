import { Schema } from 'mongoose';

export interface SeatType {
  type: string;
  total: number;
  booked: number;
}

export const SeatTypeSchema = new Schema<SeatType>(
  {
    type: { type: String, required: true },
    total: { type: Number, required: true },
    booked: { type: Number, default: 0 },
  },
  { _id: false }
);
