import "dotenv/config";

import express from "express";
import cors from "cors";
import bodyParser from "body-parser"; // <-- For Stripe Webhook raw body
import { clerkMiddleware } from "@clerk/express";

import hotelsRouter from "./api/hotel";
import reviewRouter from "./api/review";
import locationsRouter from "./api/location";
import bookingRouter from "./api/booking";
import paymentRouter from "./api/payment";


import connectDB from "./infrastructure/db";
import globalErrorHandlingMiddleware from "./api/middleware/global-error-handling-middleware";

const app = express();

app.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  paymentRouter // The webhook handler inside payment router
);

// Convert HTTP requests to JSON (except webhook above)
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(clerkMiddleware());


app.use("/api/hotels", hotelsRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/locations", locationsRouter);
app.use("/api/bookings", bookingRouter); 
app.use("/api/payments", paymentRouter); 

app.use(globalErrorHandlingMiddleware);


connectDB();

const PORT = 8000;
app.listen(PORT, () => {
  console.log("✅ Server running on http://localhost:" + PORT);
});
