import dotenv from "dotenv";

dotenv.config();

const getEnvVar = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  PORT: getEnvVar("PORT", "5001"),
  NODE_ENV: getEnvVar("NODE_ENV", "development"),

  DATABASE_URL: getEnvVar("DATABASE_URL"),

  JWT_ACCESS_SECRET: getEnvVar("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: getEnvVar("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRES_IN: getEnvVar("JWT_ACCESS_EXPIRES_IN", "15m"),
  JWT_REFRESH_EXPIRES_IN: getEnvVar("JWT_REFRESH_EXPIRES_IN", "7d"),

  SEAT_LOCK_TTL_MINUTES: parseInt(getEnvVar("SEAT_LOCK_TTL_MINUTES", "10"), 10),

  // Registering with this key grants ADMIN role
  ADMIN_REGISTRATION_KEY: getEnvVar("ADMIN_REGISTRATION_KEY", "cinebook-admin-2024"),

  // Allowed CORS origin in production
  FRONTEND_URL: getEnvVar("FRONTEND_URL", "http://localhost:5173"),
};
