import { Db, ObjectId } from "mongodb";
import type { User } from "./user.model";

const COLLECTION = "users";

export class UserRepository {
  private readonly col;

  constructor(db: Db) {
    this.col = db.collection<User>(COLLECTION);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.col.findOne({ email, deletedAt: null });
  }

  async findById(id: string): Promise<User | null> {
    if (!ObjectId.isValid(id)) return null;
    return this.col.findOne({ _id: new ObjectId(id) as any, deletedAt: null });
  }

  async insert(user: Omit<User, "_id">): Promise<User> {
    const result = await this.col.insertOne(user as any);
    return { ...user, _id: result.insertedId };
  }

  async softDelete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const result = await this.col.updateOne(
      { _id: new ObjectId(id) as any },
      { $set: { deletedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  async update(id: string, updates: Partial<User>): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const result = await this.col.updateOne(
      { _id: new ObjectId(id) as any },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }
}
