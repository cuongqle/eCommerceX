import { z } from "zod";

export const destroyUploadSchema = z.object({
  body: z.object({
    url: z.string().url(),
  }),
});
