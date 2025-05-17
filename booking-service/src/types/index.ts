export interface EmailOptions {
    to: string;
    subject?: string;
    body?: string;
    userId: string;
    userName: string;
    concertId: string;
    seatType: string;
    action: 'book' | 'cancel';
  }

  export interface Concert {
    _id?: string;
    name: string;
    date: Date;
    location: string;
    seats: SeatType[];
    createdAt?: Date;
    updatedAt?: Date;
  }

  export interface SeatType {
    type: string;
    total: number;
    booked: number;
  }