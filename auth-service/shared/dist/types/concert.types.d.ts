export interface IConcert {
    _id: string;
    title: string;
    date: Date;
    venue: string;
    seatTypes: Record<string, number>;
    availableSeats: Record<string, number>;
    createdAt: Date;
    updatedAt: Date;
}
export interface IConcertInput {
    title: string;
    date: Date;
    venue: string;
    seatTypes: Record<string, number>;
}
export interface IConcertUpdate {
    title?: string;
    date?: Date;
    venue?: string;
    seatTypes?: Record<string, number>;
}
export interface IConcertFilter {
    title?: string;
    date?: Date;
    venue?: string;
}
