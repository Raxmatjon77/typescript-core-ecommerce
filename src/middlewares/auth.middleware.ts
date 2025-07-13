import { Middleware } from "../types/middleware";
import { IncomingMessage, ServerResponse } from "http";
import { verifyToken } from "@utils/jwt";
import { UnauthorizedException } from "../utils/exception-filter";

interface JwtPayload {
  userId: string;
  role: string;
}

interface RequestWithUser extends IncomingMessage {
  user?: JwtPayload;
  params?: Record<string, string>;
  body?: any;
}

export const authMiddleware: Middleware = async (
  req: RequestWithUser,
  res: ServerResponse,
  next
) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedException("Missing or invalid Authorization header");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new UnauthorizedException("Token is required");
  }

  try {
    const payload = verifyToken(token);
    req.user = payload as JwtPayload;
  } catch (err) {
    console.error("Token verification failed:", err);
    // res.writeHead(401, { "Content-Type": "application/json" });
    throw new UnauthorizedException("Invalid or expired token");
  }

  await next();
};
