import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as settingsService from "./settings.service";

export const get = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await settingsService.getSettings();
  res.json({ success: true, data: { settings: settingsService.toPublicSettings(settings) } });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const settings = await settingsService.updateSettings(req.body);
  res.json({ success: true, data: { settings: settingsService.toPublicSettings(settings) } });
});
