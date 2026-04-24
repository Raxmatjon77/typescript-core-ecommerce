import { z } from "zod";

export const UpdateProductBodySchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  imageUrl: z.string().url().optional(),
});

export type UpdateProductBody = z.infer<typeof UpdateProductBodySchema>;
