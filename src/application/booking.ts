import { Request } from "express";
import { getAuth } from "@clerk/express";
import { default as Hotel } from "../infrastructure/entities/Hotel";
import { default as Booking } from "../infrastructure/entities/Booking";
import UnauthorizedError from "../domain/errors/unauthorized-error";
import ValidationError from "../domain/errors/validation-error";
import NotFoundError from "../domain/errors/not-found-error";
import ForbiddenError from "../domain/errors/forbidden-error";


async function generateUniqueRoomNumber(hotelId: string): Promise<number> {
  const MAX_ATTEMPTS = 10;
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const roomNumber = Math.floor(100 + Math.random() * 900);
    const existing = await Booking.findOne({ hotelId, roomNumber });
    if (!existing) return roomNumber;
  }
  
  return Number(String(Date.now()).slice(-3)) + 100;
}

export async function createBooking(req: Request) {
  const { userId } = getAuth(req);

  if (!userId) {
    throw new UnauthorizedError("Authentication required for booking.");
  }

  const { hotelId, checkInDate, checkOutDate } = req.body;

  if (!hotelId || !checkInDate || !checkOutDate) {
    throw new ValidationError("Hotel ID, check-in, and check-out dates are required.");
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    throw new ValidationError("Invalid date format provided.");
  }

  if (checkIn >= checkOut) {
    throw new ValidationError("Check-out date must be after check-in date.");
  }

  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (checkIn < today) {
    throw new ValidationError("Check-in date cannot be in the past.");
  }

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    throw new NotFoundError("Hotel not found.");
  }

  const roomNumber = await generateUniqueRoomNumber(hotelId);

  const newBooking = new Booking({
    userId,
    hotelId,
    checkIn,
    checkOut,
    roomNumber,
    paymentStatus: "PENDING",
  });

  await newBooking.save();
  return newBooking;
}

export async function getUserBookings(req: Request) {
  const { userId: authUserId } = getAuth(req);

  if (!authUserId) {
    throw new UnauthorizedError("Authentication required.");
  }

  const requestedUserId = req.params.userId;

  
  if (authUserId !== requestedUserId) {
    throw new ForbiddenError("You are not authorised to view these bookings.");
  }

  const bookings = await Booking.find({ userId: authUserId })
    .populate({
      path: "hotelId",
      select: "name location image price",
    })
    .sort({ createdAt: -1 })
    .exec();

  return bookings;
}
