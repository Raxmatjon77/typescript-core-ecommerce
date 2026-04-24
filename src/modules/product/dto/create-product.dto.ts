import { z } from "zod";

export const CreateProductBodySchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(2),
  description: z.string().min(5),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  imageUrl: z.string().url(),
});

export type CreateProductBody = z.infer<typeof CreateProductBodySchema>;
