// navozz/aidf-final-back-end/.../src/api/booking.ts

import { Router } from "express";
import asyncHandler from "express-async-handler"; 
import { createBooking, getUserBookings } from "../application/booking";

const router = Router();

/**
 * POST /api/bookings
 * Creates a new booking record with status: "PENDING".
 * Requires authentication via Clerk middleware.
 */
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const newBooking = await createBooking(req);
    res.status(201).json(newBooking);
  })
);

/**
 * GET /api/bookings/user/:userId
 * Retrieves all bookings for the authenticated user.
 */
router.get(
  "/user/:userId",
  asyncHandler(async (req, res) => {
    const bookings = await getUserBookings(req);
    res.status(200).json(bookings);
  })
);

export default router;
