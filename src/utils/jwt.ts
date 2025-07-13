import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const secret = process.env.JWT_SECRET!;
export function signAccessToken(payload: object) {
  return jwt.sign(payload, secret as any);
}

export function signRefreshToken(payload: object) {
  return jwt.sign(payload, secret as any);
}

export function verifyToken(token: string) {
  return jwt.verify(token, secret);
}

export function decodeToken(token: string) {
  return jwt.decode(token);
}
