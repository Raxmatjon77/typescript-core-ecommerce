import type { IncomingMessage, ServerResponse } from "http";
import type { AuthService } from "./auth.service";
import type { SignupBody } from "./dto/signup.dto";
import type { SigninBody } from "./dto/signin.dto";

function json(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  signup = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const body = (req as any).body as SignupBody;
    const user = await this.authService.signup(body);
    json(res, 201, { data: user });
  };

  signin = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const body = (req as any).body as SigninBody;
    const tokens = await this.authService.signin(body);
    json(res, 200, { data: tokens });
  };

  me = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const userId = ((req as any).user as { userId: string }).userId;
    const user = await this.authService.me(userId);
    json(res, 200, { data: user });
  };
}
