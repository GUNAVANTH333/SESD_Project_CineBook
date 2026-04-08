import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { ValidationError } from "../utils/AppError.js";

type RequestPart = "body" | "query" | "params";

/**
 * Middleware factory that validates a specific part of the request against a Zod schema.
 * Throws a ValidationError (422) with structured field errors on failure.
 */
export const validate =
  (schema: ZodSchema, from: RequestPart = "body") =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[from]);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      return next(new ValidationError("Validation failed", fieldErrors));
    }

    // Replace the raw input with the parsed (coerced) output
    req[from] = result.data;
    next();
  };
