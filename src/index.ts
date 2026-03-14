import "dotenv/config";

import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import asyncHandler from "express-async-handler";

import hotelsRouter from "./api/hotel";
import reviewRouter from "./api/review";
import locationsRouter from "./api/location";
import bookingRouter from "./api/booking";
import paymentRouter from "./api/payment";
import { handleWebhook } from "./application/payment";

import connectDB from "./infrastructure/db";
import globalErrorHandlingMiddleware from "./api/middleware/global-error-handling-middleware";

const app = express();

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(async (req, res) => {
    await handleWebhook(req, res);
  })
);


app.use(express.json());

// ── CORS ──
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

app.use(clerkMiddleware());

// ── Routes ──
app.use("/api/hotels", hotelsRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/locations", locationsRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/payments", paymentRouter);


app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(globalErrorHandlingMiddleware);

connectDB();

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is listening on PORT: ${PORT}`);
});
