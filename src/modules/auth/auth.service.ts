import { Db } from "mongodb";
import bcrypt from "bcrypt";
import { signAccessToken, signRefreshToken } from "../../utils/jwt";
import { User, UserSchema } from "../../models/user";
import { ForbiddenException, BadRequestException } from "../../utils/exception-filter";
import { IncomingMessage } from "http";
import { ServerResponse } from "http";

export class Auth {
  readonly #_db;

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
    if (existing) throw new ForbiddenException  ("User already exists");

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
 
    const params = (req as any).params;
    console.log("Params:", params);
    const userId = params.id;
    if (!userId) throw new BadRequestException("User ID is required");

    const user = await this.#_db.collection<User>("users").findOne({
      _id: userId as any,
    });

    if (!user) throw new BadRequestException("User not found");

    res.writeHead(200, { "Content-Type": "application/json" });

    return res.end(JSON.stringify(user));
  }

  
    }
