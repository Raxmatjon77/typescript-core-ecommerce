import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { any } from "zod";
dotenv.config();

const secret = process.env.JWT_SECRET!
export function signAccessToken(payload: object) {
  
  return jwt.sign(payload,  secret as any );
}

export function signRefreshToken(payload: object) {
  return jwt.sign(payload, secret as any);
}

export function verifyToken(token: string) {
  return jwt.verify(token, secret);
}
