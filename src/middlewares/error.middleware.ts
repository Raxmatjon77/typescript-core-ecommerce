import type { Middleware } from "@http/types";
import { CustomError } from "@common/exceptions";
import { ZodError } from "zod";

export const errorMiddleware: Middleware = async (req, res, next) => {
  try {
    await next();
  } catch (err: unknown) {
    if (res.headersSent) return;

    if (err instanceof CustomError) {
      res.writeHead(err.statusCode, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ error: { message: err.message, details: err.details ?? null } })
      );
      return;
    }

    if (err instanceof ZodError) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: {
            message: "Validation failed",
            details: err.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
        })
      );
      return;
    }

    // Log the real error server-side; never leak internals to clients
    console.error("[errorMiddleware] Unexpected error:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: { message: "Internal Server Error" } }));
  }
};
