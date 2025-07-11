import { z } from "zod";

export const ProductSchema = z.object({
  _id: z.any().optional(),
  title: z.string().min(2),
  description: z.string().min(5),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  imageUrl: z.string().url(),
  createdAt: z.date(),
});

export type Product = z.infer<typeof ProductSchema>;
