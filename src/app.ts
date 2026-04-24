import type { Db } from "mongodb";
import type { Env } from "@config/env";
import type { LoggerService } from "@common/logger.service";
import { JwtService } from "@common/jwt.service";
import { PasswordService } from "@common/password.service";
import { Router } from "@http/router";
import {
  errorMiddleware,
  corsMiddleware,
  securityHeadersMiddleware,
  bodyParserMiddleware,
  loggerMiddleware,
} from "@middlewares";
import { UserRepository } from "@modules/user/user.repository";
import { UserService } from "@modules/user/user.service";
import { userRoutes } from "@modules/user/user.routes";
import { AuthService } from "@modules/auth/auth.service";
import { authRoutes } from "@modules/auth/auth.routes";
import { ProductRepository } from "@modules/product/product.repository";
import { ProductService } from "@modules/product/product.service";
import { productRoutes } from "@modules/product/product.routes";

export function buildApp(deps: { db: Db; env: Env; logger: LoggerService }): Router {
  const { db, env, logger } = deps;

  // Shared services
  const jwt = new JwtService(env);
  const passwords = new PasswordService();

  // Repositories
  const userRepo = new UserRepository(db);
  const productRepo = new ProductRepository(db);

  // Domain services
  const authService = new AuthService(userRepo, jwt, passwords);
  const userService = new UserService(userRepo);
  const productService = new ProductService(productRepo);

  // Root router — global middleware stack (outermost first)
  const router = new Router();
  router.use(errorMiddleware);
  router.use(corsMiddleware(env));
  router.use(securityHeadersMiddleware);
  router.use(bodyParserMiddleware(env.MAX_BODY_BYTES));
  router.use(loggerMiddleware(logger));

  // Health check
  router.get("/ping", async (_req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "pong" }));
  });

  // Feature routers
  router.mount("/auth", authRoutes(authService, jwt, env));
  router.mount("/users", userRoutes(userService, jwt));
  router.mount("/products", productRoutes(productService, jwt));

  return router;
}
