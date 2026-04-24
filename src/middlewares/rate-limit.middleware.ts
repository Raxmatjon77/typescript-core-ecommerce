import type { Middleware } from "@http/types";
import { CustomError } from "@common/exceptions";
import type { Env } from "@config/env";

interface Window {
  count: number;
  resetAt: number;
}

export function rateLimitMiddleware(
  env: Pick<Env, "RATE_LIMIT_WINDOW_MS" | "RATE_LIMIT_MAX">
): Middleware {
  const store = new Map<string, Window>();

  return async (req, res, next) => {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ??
      req.socket.remoteAddress ??
      "unknown";

    const now = Date.now();
    let window = store.get(ip);

    if (!window || now >= window.resetAt) {
      window = { count: 0, resetAt: now + env.RATE_LIMIT_WINDOW_MS };
      store.set(ip, window);
    }

    window.count++;

    res.setHeader("X-RateLimit-Limit", env.RATE_LIMIT_MAX);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, env.RATE_LIMIT_MAX - window.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(window.resetAt / 1000));

    if (window.count > env.RATE_LIMIT_MAX) {
      throw new CustomError(429, "Too many requests, please try again later");
    }

    await next();
  };
}
