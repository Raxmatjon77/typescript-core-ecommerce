import { Db, ObjectId } from "mongodb";
import type { Product } from "./product.model";

const COLLECTION = "products";

export class ProductRepository {
  private readonly col;

  constructor(db: Db) {
    this.col = db.collection<Product>(COLLECTION);
  }

  async findAll(): Promise<Product[]> {
    return this.col.find({ deletedAt: null }).toArray();
  }

  async findById(id: string): Promise<Product | null> {
    if (!ObjectId.isValid(id)) return null;
    return this.col.findOne({ _id: new ObjectId(id) as any, deletedAt: null });
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.col.findOne({ slug, deletedAt: null });
  }

  async insert(product: Omit<Product, "_id">): Promise<Product> {
    const result = await this.col.insertOne(product as any);
    return { ...product, _id: result.insertedId };
  }

  async update(id: string, updates: Partial<Product>): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const result = await this.col.updateOne(
      { _id: new ObjectId(id) as any, deletedAt: null },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  async softDelete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const result = await this.col.updateOne(
      { _id: new ObjectId(id) as any, deletedAt: null },
      { $set: { deletedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }
}
