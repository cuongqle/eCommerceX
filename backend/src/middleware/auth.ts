import type { NextFunction, Request, Response } from "express";
import { User, type UserRole } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/token";

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

    if (!token) {
      throw ApiError.unauthorized();
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.id).select("email role isActive");

    if (!user || !user.isActive) {
      throw ApiError.unauthorized("Account is inactive or no longer exists");
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }
    next(ApiError.unauthorized("Invalid or expired token"));
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw ApiError.forbidden();
    }
    next();
  };
}
