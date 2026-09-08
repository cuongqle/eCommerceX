import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../utils/ApiError";

export function validate(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const details = result.error.flatten();
      throw ApiError.badRequest("Validation failed", details);
    }

    const data = result.data as { body?: unknown; params?: unknown; query?: unknown };
    if (data.body) req.body = data.body;
    next();
  };
}
