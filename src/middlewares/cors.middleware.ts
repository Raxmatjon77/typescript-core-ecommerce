import type { Middleware } from "@http/types";
import type { Env } from "@config/env";

export function corsMiddleware(env: Pick<Env, "CORS_ORIGIN" | "CORS_CREDENTIALS">): Middleware {
  return async (req, res, next) => {
    const origin = req.headers["origin"];
    const allowed = env.CORS_ORIGIN;

    if (origin === allowed || allowed === "*") {
      res.setHeader("Access-Control-Allow-Origin", origin ?? allowed);
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      if (env.CORS_CREDENTIALS) {
        res.setHeader("Access-Control-Allow-Credentials", "true");
      }
    }

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    await next();
  };
}
