import { z } from "zod";

export const UserSchema = z.object({
  _id: z.any().optional(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "admin"]).default("user"),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  deleted: z.date().optional().default(null),
});

export type User = z.infer<typeof UserSchema>;
