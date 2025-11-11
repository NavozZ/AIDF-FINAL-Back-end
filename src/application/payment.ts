
import Stripe from "stripe";
import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { default as Booking } from "../infrastructure/entities/Booking";
import { default as Hotel } from "../infrastructure/entities/Hotel";
import UnauthorizedError from "../domain/errors/unauthorized-error";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-10-29.clover',
});


const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;


async function fulfillCheckout(sessionId: string) {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items"],
    });

    const bookingId = checkoutSession.metadata?.bookingId;
    if (!bookingId) {
        return; 
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
        console.error(`Booking not found for ID: ${bookingId}`);
        return; 
    }

    if (booking.paymentStatus === "PAID") {
        return; 
    }

    if (checkoutSession.payment_status === "paid") {
        await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "PAID" });
    }
}


export async function createCheckoutSession(req: Request) {
    const { userId } = getAuth(req);
    if (!userId) {
        throw new UnauthorizedError("Authentication required.");
    }

    const { bookingId } = req.body;
    if (!bookingId) {
        throw new ValidationError("Booking ID is required.");
    }

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.userId !== userId.toString()) {
        throw new NotFoundError("Booking not found or access denied.");
    }
    
    if (booking.paymentStatus !== "PENDING") {
        throw new ValidationError(`Payment already processed: ${booking.paymentStatus}.`);
    }

    const hotel = await Hotel.findById(booking.hotelId);
    if (!hotel || !hotel.stripePriceId) {
        //
        throw new ValidationError("Stripe price ID is missing for this hotel.");
    }

    const oneDay = 24 * 60 * 60 * 1000;
    const numberOfNights = Math.max(1, Math.round(Math.abs((booking.checkOut.getTime() - booking.checkIn.getTime()) / oneDay)));
    

    const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded", 
        line_items: [{ price: hotel.stripePriceId, quantity: numberOfNights }],
        mode: "payment",
        return_url: `${FRONTEND_URL}/booking/complete?session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
            bookingId: booking._id.toString(), // CRITICAL for webhook linking
        },
        customer_email: req.auth.user?.emailAddresses[0]?.emailAddress || undefined,
    });

   
    return { clientSecret: session.client_secret, sessionId: session.id };
}


export async function retrieveSessionStatus(req: Request) {
    const sessionId = req.query.session_id as string;
    if (!sessionId) {
        throw new ValidationError("Session ID is required.");
    }


    await fulfillCheckout(sessionId); 

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    const bookingId = checkoutSession.metadata?.bookingId;

    const booking = await Booking.findById(bookingId);
    const hotel = booking ? await Hotel.findById(booking.hotelId) : null;

    if (!booking || !hotel) {
        throw new NotFoundError("Booking or associated hotel not found.");
    }

    return {
        booking: booking.toObject(),
        hotel: hotel.toObject(),
        status: checkoutSession.status,
        customer_email: checkoutSession.customer_details?.email || 'N/A',
        paymentStatus: booking.paymentStatus, 
    };
}



export async function handleWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    const payload = req.body;

    let event: Stripe.Event;

    try {
        
        event = stripe.webhooks.constructEvent(payload, sig!, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        const error = err as Error;
        console.error(`Webhook Error: ${error.message}`);
        
        res.status(400).send(`Webhook Error: ${error.message}`);
        return;
    }

    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
        const session = event.data.object as Stripe.Checkout.Session;
        await fulfillCheckout(session.id);
    }

    res.status(200).json({ received: true });
}