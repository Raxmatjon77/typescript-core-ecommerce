import { z } from "zod";

export const UserSchema = z.object({
  _id: z.any().optional(),
  email: z.string().email(),
  password: z.string(),
  role: z.enum(["user", "admin"]).default("user"),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().default(null),
});

export type User = z.infer<typeof UserSchema>;
