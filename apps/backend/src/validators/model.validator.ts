import { z } from "zod";

export const upload_model_schema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  price: z.number().int().positive(),
  file_url: z.string().url(),
  preview_url: z.string().url().optional(),
  artist_id: z.string().uuid(),
});

export const model_id_param = z.object({
  id: z.string().uuid(),
});
