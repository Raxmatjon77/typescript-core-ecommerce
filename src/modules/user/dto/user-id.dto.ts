import { z } from "zod";

export const UserIdParamsSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
});

export type UserIdParams = z.infer<typeof UserIdParamsSchema>;
