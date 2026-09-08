import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as productService from "./product.service";

export const listStore = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.listStoreProducts(req.query);
  res.json({ success: true, data: result });
});

export const getStore = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getStoreProduct(req.params.slug as string);
  res.json({ success: true, data: { product } });
});

export const listAdmin = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.listAdminProducts(req.query);
  res.json({ success: true, data: result });
});

export const getAdmin = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getAdminProduct(req.params.id as string);
  res.json({ success: true, data: { product } });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ success: true, data: { product } });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(req.params.id as string, req.body);
  res.json({ success: true, data: { product } });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id as string);
  res.json({ success: true, message: "Product deleted" });
});
