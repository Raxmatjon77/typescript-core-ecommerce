import type { UserRepository } from "@modules/user/user.repository";
import type { JwtService } from "@common/jwt.service";
import type { PasswordService } from "@common/password.service";
import type { User } from "@modules/user/user.model";
import type { SignupBody } from "./dto/signup.dto";
import type { SigninBody } from "./dto/signin.dto";
import {
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from "@common/exceptions";

export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly jwt: JwtService,
    private readonly passwords: PasswordService
  ) {}

  async signup(body: SignupBody): Promise<Omit<User, "password">> {
    const existing = await this.userRepo.findByEmail(body.email);
    if (existing) throw new ConflictException("Email already registered");

    const hashedPassword = await this.passwords.hash(body.password);
    const now = new Date();
    const newUser = await this.userRepo.insert({
      email: body.email,
      password: hashedPassword,
      role: body.role,
      createdAt: now,
      deletedAt: null,
    });

    const { password: _, ...safe } = newUser;
    return safe;
  }

  async signin(body: SigninBody): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepo.findByEmail(body.email);
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const valid = await this.passwords.compare(body.password, user.password);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    const payload = { userId: String(user._id), role: user.role };
    return {
      accessToken: this.jwt.signAccessToken(payload),
      refreshToken: this.jwt.signRefreshToken(payload),
    };
  }

  async me(userId: string): Promise<Omit<User, "password">> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException("User not found");
    const { password: _, ...safe } = user;
    return safe;
  }
}
