import { z } from "zod";
import { USER_ROLES } from "../../models/User";

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: z.string().min(8).max(72),
    role: z.enum(USER_ROLES).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    email: z.string().email().optional(),
    role: z.enum(USER_ROLES).optional(),
    isActive: z.boolean().optional(),
  }),
});
