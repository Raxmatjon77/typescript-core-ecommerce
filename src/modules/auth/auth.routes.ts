import { Router } from "@http/router";
import type { AuthService } from "./auth.service";
import type { JwtService } from "@common/jwt.service";
import { AuthController } from "./auth.controller";
import {
  authMiddleware,
  rateLimitMiddleware,
  validate,
} from "@middlewares";
import { SignupBodySchema } from "./dto/signup.dto";
import { SigninBodySchema } from "./dto/signin.dto";
import type { Env } from "@config/env";

export function authRoutes(
  authService: AuthService,
  jwt: JwtService,
  env: Pick<Env, "RATE_LIMIT_WINDOW_MS" | "RATE_LIMIT_MAX">
): Router {
  const router = new Router();
  const ctrl = new AuthController(authService);
  const auth = authMiddleware(jwt);
  const rateLimit = rateLimitMiddleware(env);

  router.post("/signup", ctrl.signup, [rateLimit, validate(SignupBodySchema)]);
  router.post("/signin", ctrl.signin, [rateLimit, validate(SigninBodySchema)]);
  router.get("/me", ctrl.me, [auth]);

  return router;
}
