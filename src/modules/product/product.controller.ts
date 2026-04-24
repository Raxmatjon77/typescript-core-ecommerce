import type { IncomingMessage, ServerResponse } from "http";
import type { ProductService } from "./product.service";
import type { CreateProductBody } from "./dto/create-product.dto";
import type { UpdateProductBody } from "./dto/update-product.dto";

function json(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  list = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const products = await this.productService.list();
    json(res, 200, { data: products });
  };

  getById = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const { productId } = (req as any).params as { productId: string };
    const product = await this.productService.getById(productId);
    json(res, 200, { data: product });
  };

  create = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const body = (req as any).body as CreateProductBody;
    const product = await this.productService.create(body);
    json(res, 201, { data: product });
  };

  update = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const { productId } = (req as any).params as { productId: string };
    const body = (req as any).body as UpdateProductBody;
    const product = await this.productService.update(productId, body);
    json(res, 200, { data: product });
  };

  delete = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const { productId } = (req as any).params as { productId: string };
    await this.productService.delete(productId);
    res.writeHead(204);
    res.end();
  };
}
