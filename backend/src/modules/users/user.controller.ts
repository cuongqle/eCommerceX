import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as userService from "./user.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.listUsers(req.query);
  res.json({ success: true, data: result });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({ success: true, data: { user } });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.params.id as string, req.body);
  res.json({ success: true, data: { user } });
});
