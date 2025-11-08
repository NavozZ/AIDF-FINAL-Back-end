// navozz/aidf-final-back-end/.../src/api/booking.ts

import { Router } from "express";
import asyncHandler from "express-async-handler"; 
import { createBooking } from "../application/booking";

const router = Router();

/**
 * POST /api/bookings
 * Creates a new booking record with status: "PENDING".
 * Requires authentication via Clerk middleware.
 */
router.post(
    "/",
    asyncHandler(async (req, res) => {
        // The application layer handles authentication check via req.auth
        const newBooking = await createBooking(req);
        
        // Returns the new booking object, including the MongoDB _id needed for payment.
        res.status(201).json(newBooking);
    })
);

export default router;