import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as categoryService from "./category.service";

export const listPublic = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoryService.listPublicCategories();
  res.json({ success: true, data: { categories } });
});

export const listAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoryService.listAdminCategories();
  res.json({ success: true, data: { categories } });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json({ success: true, data: { category } });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.updateCategory(req.params.id as string, req.body);
  res.json({ success: true, data: { category } });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.deleteCategory(req.params.id as string);
  res.json({ success: true, message: "Category deleted" });
});
