import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    slug: z.string().min(2).max(80).optional(),
    description: z.string().max(300).optional(),
    parent: z.string().min(1).nullable().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    slug: z.string().min(2).max(80).optional(),
    description: z.string().max(300).optional(),
    parent: z.string().min(1).nullable().optional(),
    isActive: z.boolean().optional(),
  }),
});
