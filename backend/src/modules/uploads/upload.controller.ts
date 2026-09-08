import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as uploadService from "./upload.service";

export const signature = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: uploadService.createUploadSignature() });
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const result = await uploadService.destroyUpload(req.body.url);
  res.json({ success: true, data: result });
});
