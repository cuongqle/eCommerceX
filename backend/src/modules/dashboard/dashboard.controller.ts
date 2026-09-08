import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { getDashboardStats } from "./dashboard.service";

export const stats = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getDashboardStats();
  res.json({ success: true, data });
});
