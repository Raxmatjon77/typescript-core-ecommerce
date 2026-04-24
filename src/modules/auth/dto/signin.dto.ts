import { z } from "zod";

export const SigninBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export type SigninBody = z.infer<typeof SigninBodySchema>;
