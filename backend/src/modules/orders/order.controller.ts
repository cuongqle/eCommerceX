import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as orderService from "./order.service";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrder(
    req.user!.id,
    req.body.shippingAddress,
    req.body.shippingFee ?? 0
  );
  res.status(201).json({ success: true, data: { order } });
});

export const listMine = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.listMyOrders(req.user!.id, req.query);
  res.json({ success: true, data: result });
});

export const getMine = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getMyOrder(req.user!.id, req.params.id as string);
  res.json({ success: true, data: { order } });
});

export const listAdmin = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.listAdminOrders(req.query);
  res.json({ success: true, data: result });
});

export const getAdmin = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getAdminOrder(req.params.id as string);
  res.json({ success: true, data: { order } });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateOrderStatus(req.params.id as string, req.body);
  res.json({ success: true, data: { order } });
});
