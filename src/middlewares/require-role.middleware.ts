import type { Middleware } from "@http/types";
import { ForbiddenException, UnauthorizedException } from "@common/exceptions";

export function requireRole(...roles: string[]): Middleware {
  return async (req, res, next) => {
    const user = (req as any).user as { userId: string; role: string } | undefined;
    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }
    if (!roles.includes(user.role)) {
      throw new ForbiddenException("Insufficient permissions");
    }
    await next();
  };
}
