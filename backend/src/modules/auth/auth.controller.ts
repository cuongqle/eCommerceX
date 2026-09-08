import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as authService from "./auth.service";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerCustomer(req.body);
  res.status(201).json({ success: true, data: result });
});

export const loginStore = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.json({ success: true, data: result });
});

export const loginAdmin = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login({ ...req.body, expectedRole: "admin" });
  res.json({ success: true, data: result });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getProfile(req.user!.id);
  res.json({ success: true, data: { user } });
});
