import { z } from "zod";

export const OrderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1),
  price: z.number().positive(),
});

export const OrderSchema = z.object({
  _id: z.any().optional(),
  userId: z.string(),
  items: z.array(OrderItemSchema),
  total: z.number().positive(),
  status: z
    .enum(["pending", "paid", "shipped", "cancelled"])
    .default("pending"),
  createdAt: z.date(),
});

export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
