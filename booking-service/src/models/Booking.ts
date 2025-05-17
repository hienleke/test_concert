import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  userId: string;
  concertId: string;
  seatType: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    concertId: {
      type: String,
      required: true,
      index: true,
    },
    seatType: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate bookings
bookingSchema.index({ userId: 1, concertId: 1, seatType: 1 }, { unique: true });

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function (): boolean {
  return this.status === "confirmed" && this.paymentStatus === "completed";
};

export const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
