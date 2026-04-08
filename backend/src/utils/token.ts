import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { JwtPayload } from "../middlewares/authMiddleware.js";

export const generateAccessToken = (payload: Omit<JwtPayload, "iat" | "exp">): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};

export const generateRefreshToken = (payload: Omit<JwtPayload, "iat" | "exp">): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
};
