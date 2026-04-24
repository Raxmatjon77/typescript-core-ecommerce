import { z } from "zod";

export const ProductIdParamsSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
});

export type ProductIdParams = z.infer<typeof ProductIdParamsSchema>;
