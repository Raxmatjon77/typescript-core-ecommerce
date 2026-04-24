import { Router } from "@http/router";
import type { UserService } from "./user.service";
import type { JwtService } from "@common/jwt.service";
import { UserController } from "./user.controller";
import { authMiddleware, requireRole, validate } from "@middlewares";
import { UserIdParamsSchema } from "./dto/user-id.dto";

export function userRoutes(userService: UserService, jwt: JwtService): Router {
  const router = new Router();
  const ctrl = new UserController(userService);

  const auth = authMiddleware(jwt);
  const admin = requireRole("admin");

  router.get(
    "/:userId",
    ctrl.getById,
    [auth, admin, validate(UserIdParamsSchema, "params")]
  );

  return router;
}
