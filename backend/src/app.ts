import express from "express";
import cors from "cors";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { env } from "./config/env.js";

import authRoutes from "./routes/auth.routes.js";
import movieRoutes from "./routes/movie.routes.js";
import multiplexRoutes from "./routes/multiplex.routes.js";
import showRoutes from "./routes/show.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

const app = express();

app.use(cors({
  origin: env.NODE_ENV === "production"
    ? [env.FRONTEND_URL, "https://sesd-project-cine-book.onrender.com"].filter(Boolean)
    : "*",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({ success: true, message: "CineBook API is running" });
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "OK", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/multiplexes", multiplexRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;