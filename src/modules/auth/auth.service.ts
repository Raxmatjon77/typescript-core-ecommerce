import { Db, ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import {
  signAccessToken,
  signRefreshToken,
  ForbiddenException,
  BadRequestException,
} from "@utils";
import { User, UserSchema } from "@models";
import { IncomingMessage, ServerResponse } from "http";

export class Auth {
  readonly #_db: Db;

  constructor(db: Db) {
    this.#_db = db;
  }
  async signup(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const input = req.body;
    const existing = await this.#_db
      .collection<User>("users")
      .findOne({ email: input.email });

    if (!input.email || !input.password) {
      throw new ForbiddenException("credentials required !");
    }
    if (existing) throw new ForbiddenException("User already exists");

    const hashedPassword = await bcrypt
      .hash(input.password, 10)
      .catch((e) => console.log(e));

    const user = UserSchema.parse({
      email: input.email,
      password: hashedPassword,
      role: "user",
      createdAt: new Date(),
    });

    await this.#_db.collection("users").insertOne(user);
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "User created" }));
  }

  async signin(req: IncomingMessage, res: ServerResponse) {
    const input = (req as any).body as { email: string; password: string };

    const { email, password } = input;
    const user = await this.#_db.collection<User>("users").findOne({ email });
    if (!user) throw new BadRequestException("Invalid credentials");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new BadRequestException("Invalid credentials");

    const payload = { userId: user._id?.toString(), role: user.role };

    res.writeHead(201, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload),
      })
    );
  }

  async getUserById(req: IncomingMessage, res: ServerResponse): Promise<any> {
    const userId = req.user?.userId;
    console.log("User ID:", userId);
    if (!userId) throw new BadRequestException("User ID is required");

    if (!/^[a-fA-F0-9]{24}$/.test(userId)) {
      throw new BadRequestException("Invalid User ID format");
    }
    const users = await this.#_db.collection<User>("users").find().toArray();

    if (users.length === 0) {
      throw new BadRequestException("No users found");
    }

    const user = await this.#_db.collection<User>("users").findOne({
      _id: new ObjectId(userId as string),
    });

    if (!user) throw new BadRequestException("User not found");

    await this.#_test("test");
    res.writeHead(200, { "Content-Type": "application/json" });

    return res.end(
      JSON.stringify({
        id: user._id?.toString(),
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })
    );
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
