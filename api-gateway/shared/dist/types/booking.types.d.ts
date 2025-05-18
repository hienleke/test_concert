export interface IBooking {
    _id: string;
    userId: string;
    concertId: string;
    seatType: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}
export interface IBookingInput {
    concertId: string;
    seatType: string;
    userId: string;
}
export interface IBookingUpdate {
    status?: 'pending' | 'confirmed' | 'cancelled';
}
export interface IBookingFilter {
    userId?: string;
    concertId?: string;
    status?: 'pending' | 'confirmed' | 'cancelled';
}
