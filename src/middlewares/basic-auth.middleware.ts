import { JwtPayload, Middleware } from "@types";
import { IncomingMessage, ServerResponse } from "http";
import { verifyToken, UnauthorizedException } from "@utils";

interface RequestWithUser extends IncomingMessage {
  user?: JwtPayload;
  params?: Record<string, string>;
  body?: any;
}

export const basicAuthMiddlware: Middleware = async (
  req: RequestWithUser,
  res: ServerResponse,
  next
) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    throw new UnauthorizedException("Missing or invalid Authorization header");
  }

   const base64Credentials = authHeader.split(" ")[1];
   const credentials = Buffer.from(base64Credentials, "base64").toString(
     "ascii"
   );
   const [username, password] = credentials.split(":");

   if (username !=='admin' || password !=='pass123') {
    
    throw new UnauthorizedException("credentials dont match our records !")
   }

  try {
    // const payload = verifyToken(token);
    // req.user = payload as JwtPayload;

  } catch (err) {
    console.error("Token verification failed:", err);
    throw new UnauthorizedException("Invalid or expired token");
  }

  console.log("User role:", req.user);
  
  if(req.user.role !== "admin") {
    throw new UnauthorizedException("Permission denied: [Admin access required");
  }
  await next();
};
