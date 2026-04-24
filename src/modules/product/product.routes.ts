import { Router } from "@http/router";
import type { ProductService } from "./product.service";
import type { JwtService } from "@common/jwt.service";
import { ProductController } from "./product.controller";
import { authMiddleware, requireRole, validate } from "@middlewares";
import { CreateProductBodySchema } from "./dto/create-product.dto";
import { UpdateProductBodySchema } from "./dto/update-product.dto";
import { ProductIdParamsSchema } from "./dto/product-id.dto";

export function productRoutes(productService: ProductService, jwt: JwtService): Router {
  const router = new Router();
  const ctrl = new ProductController(productService);
  const auth = authMiddleware(jwt);
  const admin = requireRole("admin");
  const guards = [auth, admin];

  router.get("/", ctrl.list, guards);
  router.post("/", ctrl.create, [...guards, validate(CreateProductBodySchema)]);
  router.get("/:productId", ctrl.getById, [...guards, validate(ProductIdParamsSchema, "params")]);
  router.patch("/:productId", ctrl.update, [...guards, validate(ProductIdParamsSchema, "params"), validate(UpdateProductBodySchema)]);
  router.delete("/:productId", ctrl.delete, [...guards, validate(ProductIdParamsSchema, "params")]);

  return router;
}
