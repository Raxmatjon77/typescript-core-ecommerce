import jwt from "jsonwebtoken";
import type { Env } from "@config/env";

export interface JwtPayload {
  userId: string;
  role: string;
}

export class JwtService {
  private readonly secret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor(env: Pick<Env, "JWT_SECRET" | "JWT_ACCESS_EXPIRES_IN" | "JWT_REFRESH_EXPIRES_IN">) {
    this.secret = env.JWT_SECRET;
    this.accessExpiresIn = env.JWT_ACCESS_EXPIRES_IN;
    this.refreshExpiresIn = env.JWT_REFRESH_EXPIRES_IN;
  }

  signAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.accessExpiresIn } as jwt.SignOptions);
  }

  signRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.refreshExpiresIn } as jwt.SignOptions);
  }

  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, this.secret) as JwtPayload;
  }
}
