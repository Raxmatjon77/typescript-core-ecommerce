import type { UserRepository } from "./user.repository";
import type { User } from "./user.model";
import { NotFoundException } from "@common/exceptions";

export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async getById(userId: string): Promise<Omit<User, "password">> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException("User not found");
    const { password: _, ...safe } = user;
    return safe;
  }
}
