import type { Middleware } from "@http/types";
import type { ZodSchema } from "zod";
import { BadRequestException } from "@common/exceptions";

type Target = "body" | "params" | "query";

export function validate(schema: ZodSchema, target: Target = "body"): Middleware {
  return async (req, res, next) => {
    const result = schema.safeParse((req as any)[target] ?? {});
    if (!result.success) {
      throw new BadRequestException("Validation failed", result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })));
    }
    (req as any)[target] = result.data;
    await next();
  };
}
