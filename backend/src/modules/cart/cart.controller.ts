import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as cartService from "./cart.service";

export const get = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.getCart(req.user!.id);
  res.json({ success: true, data: { cart } });
});

export const add = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.addItem(req.user!.id, req.body.productId, req.body.quantity);
  res.json({ success: true, data: { cart } });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.updateItem(req.user!.id, req.params.productId as string, req.body.quantity);
  res.json({ success: true, data: { cart } });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.removeItem(req.user!.id, req.params.productId as string);
  res.json({ success: true, data: { cart } });
});
