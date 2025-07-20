import { Db, ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import {
  signAccessToken,
  signRefreshToken,
  ForbiddenException,
  BadRequestException,
} from "@utils";
import { Product, ProductSchema, User } from "@models";
import { IncomingMessage, ServerResponse } from "http";

export class ProductService {
  readonly #_db: Db;

  constructor(db: Db) {
    this.#_db = db;
  }

  async create(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const input = req.body;
    const existing = await this.#_db
      .collection<Product>("product")
      .findOne({ slug: input.slug, deletedAt: null });

    if (existing)
      throw new ForbiddenException(
        `Product  already exists with  slug ${input.slug}`
      );

    const product = ProductSchema.parse({
      slug: input.slug,
      title: input.title,
      description: input.description,
      price: input.price,
      stock: input.stock,
      imageUrl: input.imageUrl,
      createdAt: new Date(),
    });

    await this.#_db.collection("product").insertOne(product);
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "product created" }));
  }

  async read(req: IncomingMessage, res: ServerResponse) {}

  async readAll(req: IncomingMessage, res: ServerResponse): Promise<any> {}

  async update(req: IncomingMessage, res: ServerResponse): Promise<any> {}

  async delete(req: IncomingMessage, res: ServerResponse): Promise<any> {
    const productId = req.params?.productId;
    console.log("User ID:", productId);

    if (!productId) throw new BadRequestException("Product ID is required");

    if (!/^[a-fA-F0-9]{24}$/.test(productId)) {
      throw new BadRequestException("Invalid product ID format");
    }

    console.log("productId", productId);

    const product = await this.#_db.collection<Product>("product").findOne({
      _id: new ObjectId(productId),
      deletedAt: null,
    });

    const all = await this.#_db.collection<Product>("product").find().toArray();

    console.log(all);

    if (!product) throw new BadRequestException("Product not found");

    await this.#_db.collection<Product>("product").updateOne(
      {
        _id: new ObjectId(product._id),
      },
      {
        $set: {
          deletedAt: new Date(),
        },
      }
    );

    res.writeHead(204, { "Content-Type": "application/json" });

    res.end();
  }
  async #_test(a: string): Promise<string> {
    debugger;

    // await new Promise((resolve) => setTimeout(resolve, 3000));
    if (!a) throw new BadRequestException("Parameter 'a' is required");
    if (typeof a !== "string")
      throw new BadRequestException("Parameter 'a' must be a string");
    console.log("Test method called with:", a);
    return a;
  }
}
