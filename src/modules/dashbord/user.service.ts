import { JwtPayload } from "@types";
import { BadRequestException, NotFoundException } from "@utils";
import { IncomingMessage, ServerResponse } from "http";
import { Db, ObjectId } from "mongodb";

interface RequestWithUser extends IncomingMessage {
  user?: JwtPayload;
  params?: Record<string, string>;
  body?: any;
}
export class dashboardUserController {
  readonly #_db: Db;
  constructor(db: Db) {
    this.#_db = db;
  }

  async getUserById(req: RequestWithUser, res: ServerResponse): Promise<void> {
    const userId = req.params?.userId || req.body?.userId;
    if (!userId) throw new BadRequestException("User ID is required");

    const buf = Buffer.from("hello");
    console.log("buf", buf.toString("ascii"));

    const user = await this.#_db
      .collection("users")
      .findOne({ _id: new ObjectId(userId), deleted: null });
    if (!user) throw new NotFoundException("User not found");

    console.log("User found:", user);

    const response = {
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deleted: user.deleted,
    };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(response));
  }

  async updateUser(userId: string, updates: Partial<any>) {
    if (!userId) throw new BadRequestException("User ID is required");

    const result = await this.#_db
      .collection("users")
      .updateOne({ _id: new ObjectId(userId) }, { $set: updates });

    if (result.matchedCount === 0) {
      throw new NotFoundException("User not found");
    }

    return result.modifiedCount > 0;
  }

  async deleteUser(userId: string) {
    if (!userId) throw new BadRequestException("User ID is required");

    const result = await this.#_db
      .collection("users")
      .updateOne({ _id: new ObjectId(userId) }, { $set: { deleted: true } });

    if (result.modifiedCount === 0) {
      throw new NotFoundException("User not found");
    }

    return true;
  }
}
