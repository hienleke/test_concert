import { SeatType } from './seatType';

export interface Concert {
  _id?: string;
  name: string;
  date: Date;
  location: string;
  seats: SeatType[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConcertInput {
  name: string;
  date: Date;
  location: string;
  seats: SeatType[];
}