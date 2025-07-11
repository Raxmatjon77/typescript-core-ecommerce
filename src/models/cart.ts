import { z } from "zod";

export const CartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1),
});

export const CartSchema = z.object({
  _id: z.any().optional(),
  userId: z.string(),
  items: z.array(CartItemSchema),
  updatedAt: z.date(),
});

export type Cart = z.infer<typeof CartSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
