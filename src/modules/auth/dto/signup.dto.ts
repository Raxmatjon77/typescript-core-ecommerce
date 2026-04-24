import { z } from "zod";

export const SignupBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "admin"]).default("user"),
});

export type SignupBody = z.infer<typeof SignupBodySchema>;
