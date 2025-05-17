// src/controllers/bookingController.ts
import { Request, Response } from "express";
import * as BookingService from "../service/bookingService";
import { logger } from "@concert/shared";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const bookingData = await BookingService.createBooking(req.body);
    res.status(200).json(bookingData);
  } catch (error: any) {
    logger.error("Error creating booking:", error);
    res.status(400).json({ error: error.message });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const booking = await BookingService.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    logger.error("Error getting booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await BookingService.getUserBookings(req.params.userId);
    res.json(bookings);
  } catch (error) {
    logger.error("Error getting user bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    await BookingService.cancelBooking(req.body);
    res.status(200).json({ message: "Booking canceled successfully" });
  } catch (error: any) {
    logger.error("Error canceling booking:", error);
    res.status(400).json({ error: error.message });
  }
};
