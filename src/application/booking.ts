
import { Request } from "express";
import { getAuth } from "@clerk/express"; 
import { default as Hotel } from "../infrastructure/entities/Hotel";
import { default as Booking } from "../infrastructure/entities/Booking";
import UnauthorizedError from "../domain/errors/unauthorized-error";
import ValidationError from "../domain/errors/validation-error";
import NotFoundError from "../domain/errors/not-found-error";


function generateUniqueRoomNumber(): number {
  return Math.floor(100 + Math.random() * 900);
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

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkIn >= checkOut) {
    throw new ValidationError("Invalid dates. Check-out must be after check-in.");
  }

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    throw new NotFoundError("Hotel not found.");
  }

  const roomNumber = generateUniqueRoomNumber();

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
  const { userId } = getAuth(req);
  
  if (!userId) {
    throw new UnauthorizedError("Authentication required.");
  }

  const bookings = await Booking.find({ userId })
    .populate({
      path: "hotelId",
      select: "name location image price",
    })
    .sort({ checkIn: -1 })
    .exec();

  return bookings;
}
