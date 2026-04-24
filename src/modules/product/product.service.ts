import type { ProductRepository } from "./product.repository";
import type { Product } from "./product.model";
import type { CreateProductBody } from "./dto/create-product.dto";
import type { UpdateProductBody } from "./dto/update-product.dto";
import {
  NotFoundException,
  ConflictException,
} from "@common/exceptions";

export class ProductService {
  constructor(private readonly productRepo: ProductRepository) {}

  async list(): Promise<Product[]> {
    return this.productRepo.findAll();
  }

  async getById(productId: string): Promise<Product> {
    const product = await this.productRepo.findById(productId);
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  async create(body: CreateProductBody): Promise<Product> {
    const existing = await this.productRepo.findBySlug(body.slug);
    if (existing) throw new ConflictException("Slug already in use");

    return this.productRepo.insert({
      ...body,
      createdAt: new Date(),
      deletedAt: null,
    });
  }

  async update(productId: string, body: UpdateProductBody): Promise<Product> {
    const product = await this.productRepo.findById(productId);
    if (!product) throw new NotFoundException("Product not found");

    await this.productRepo.update(productId, body);
    return (await this.productRepo.findById(productId))!;
  }

  async delete(productId: string): Promise<void> {
    const deleted = await this.productRepo.softDelete(productId);
    if (!deleted) throw new NotFoundException("Product not found");
  }
}
