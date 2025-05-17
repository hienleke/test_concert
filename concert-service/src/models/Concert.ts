import mongoose, { Schema, Document, Model } from 'mongoose';
import { SeatType, SeatTypeSchema } from './SeatType';

export interface ConcertInput {
  name: string;
  date: Date;
  location: string;
  seats: SeatType[];
}

export interface Concert extends ConcertInput {
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConcertDocument extends Document {
  name: string;
  date: Date;
  location: string;
  seats: SeatType[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ConcertSchema = new Schema<ConcertDocument>(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    seats: { type: [SeatTypeSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

export const ConcertModel: Model<ConcertDocument> = mongoose.model<ConcertDocument>('Concert', ConcertSchema);
