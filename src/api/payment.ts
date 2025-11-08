// navozz/aidf-final-back-end/.../src/api/payment.ts

import { Router } from "express";
import asyncHandler from "express-async-handler";
import { createCheckoutSession, retrieveSessionStatus, handleWebhook } from "../application/payment";

const router = Router();

/**
 * POST /api/payments/create-checkout-session
 * Initiates the Stripe Embedded Checkout session and returns the clientSecret.
 */
router.post(
    "/create-checkout-session",
    asyncHandler(async (req, res) => {
        // Calls the Stripe API logic
        const result = await createCheckoutSession(req); 
        // Returns clientSecret to the frontend for Embedded Checkout
        res.status(200).json(result);
    })
);

/**
 * GET /api/payments/session-status?session_id=...
 * Retrieves the final payment status and idempotently updates the database status.
 */
router.get(
    "/session-status",
    asyncHandler(async (req, res) => {
        // Also serves as an idempotent update route
        const sessionStatus = await retrieveSessionStatus(req);
        res.status(200).json(sessionStatus);
    })
);

// NOTE: The POST /api/stripe/webhook route is registered directly in src/index.ts 
// using raw body parser and pointing to the handleWebhook function. 
// We include the handler here for the webhook destination to work via `paymentRouter`.
router.post(
    "/webhook",
    asyncHandler(async (req, res) => {
        // The raw body is passed by index.ts middleware.
        await handleWebhook(req, res);
    })
);

export default router;