import "dotenv/config";
import app from "./app.js";
import prisma from "./config/db.js";
import { env } from "./config/env.js";

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`[CineBook] Server running on port ${PORT} in ${env.NODE_ENV} mode`);
});

const shutdown = async (signal: string) => {
  console.log(`\n[CineBook] Received ${signal}. Shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  console.error("[CineBook] Unhandled Rejection:", reason);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("[CineBook] Uncaught Exception:", err);
  process.exit(1);
});