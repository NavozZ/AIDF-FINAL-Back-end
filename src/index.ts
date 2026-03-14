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

const allowedOrigins = [
  process.env.FRONTEND_URL,          // production Netlify URL
  "http://localhost:5173",            // local Vite dev server
  "http://localhost:3000",            // fallback local port
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman, curl, server-to-server)
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


app.use("/api/hotels", hotelsRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/locations", locationsRouter);
app.use("/api/bookings", bookingRouter); 
app.use("/api/payments", paymentRouter); 

app.use(globalErrorHandlingMiddleware);


connectDB();

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("Server is listening on PORT: ", PORT);
});
