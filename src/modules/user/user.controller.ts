import type { IncomingMessage, ServerResponse } from "http";
import type { UserService } from "./user.service";

export class UserController {
  constructor(private readonly userService: UserService) {}

  getById = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const { userId } = (req as any).params as { userId: string };
    const user = await this.userService.getById(userId);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: user }));
  };
}
