import { z } from "zod";

const productBody = z.object({
  name: z.string().min(2).max(160),
  slug: z.string().min(2).max(160).optional(),
  description: z.string().min(10),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
  images: z.array(z.string().url()).optional(),
  category: z.string().min(1),
  sku: z.string().min(2).max(40),
  stock: z.number().int().nonnegative(),
  isPublished: z.boolean().optional(),
});

export const createProductSchema = z.object({
  body: productBody,
});

export const updateProductSchema = z.object({
  body: productBody.partial(),
});
