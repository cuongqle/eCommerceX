import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ success: false, message: "Invalid id" });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      details: err.errors,
    });
    return;
  }

  const mongoErr = err as { code?: number; keyValue?: Record<string, unknown> };
  if (mongoErr.code === 11000) {
    res.status(409).json({
      success: false,
      message: "Duplicate value",
      details: mongoErr.keyValue,
    });
    return;
  }

  console.error(err);

  res.status(500).json({
    success: false,
    message: env.NODE_ENV === "production" ? "Internal server error" : (err as Error).message,
  });
}
