
import { Router } from "express";
import asyncHandler from "express-async-handler"; 
import { createBooking, getUserBookings } from "../application/booking";

const router = Router();


router.post(
  "/",
  asyncHandler(async (req, res) => {
    const newBooking = await createBooking(req);
    res.status(201).json(newBooking);
  })
);

router.get(
  "/user/:userId",
  asyncHandler(async (req, res) => {
    const bookings = await getUserBookings(req);
    res.status(200).json(bookings);
  })
);

export default router;
