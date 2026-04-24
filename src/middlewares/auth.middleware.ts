import type { Middleware } from "@http/types";
import type { JwtService } from "@common/jwt.service";
import { UnauthorizedException } from "@common/exceptions";

export function authMiddleware(jwt: JwtService): Middleware {
  return async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing or invalid Authorization header");
    }

    const token = authHeader.slice(7);
    try {
      (req as any).user = jwt.verifyToken(token);
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }

    await next();
  };
}
