import { z } from "zod";

const optionalMediaUrl = z.union([z.string().url(), z.literal("")]);

export const updateSettingsSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    tagline: z.string().max(160).optional(),
    announcement: z.string().max(160).optional(),
    logoUrl: optionalMediaUrl.optional(),
    iconUrl: optionalMediaUrl.optional(),
  }),
});
