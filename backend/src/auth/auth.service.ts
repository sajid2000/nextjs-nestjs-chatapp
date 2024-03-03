import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";

import { ValidationException } from "@/common/Exceptions/ValidationException";
import { UserEntity } from "@/user/entities/user.entity";
import { UserService } from "@/user/services/user.service";

import { AccessTokenPayload } from "./auth.module";
import { LoginDto, RegisterDto } from "./dto/auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async signUp(dto: RegisterDto) {
    try {
      const { fullName, avatar, phone, password } = dto;

      return await this.userService.create({ fullName, avatar, phone, password });
    } catch (error) {
      if (error instanceof ConflictException) throw new ValidationException("email", error.message);

      throw error;
    }
  }

  async signIn(dto: LoginDto) {
    const { password, phone } = dto;
    try {
      const user = await this.userService.findByPhone(phone);

      if (!bcrypt.compareSync(password, user.password)) {
        throw new ValidationException("password", "Invalid password");
      }

      const { accessToken } = this.generateAuthTokens(user.id);

      return { accessToken, user: new UserEntity(user) };
    } catch (error) {
      if (error instanceof NotFoundException) throw new ValidationException("phone", error.message);

      throw error;
    }
  }

  async validateUser(id: number) {
    const user = await this.userService.findById(id);

    if (!user) throw new UnauthorizedException();

    return user;
  }

  private generateAuthTokens(userId: number) {
    const payload: AccessTokenPayload = { userId };

    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }
}
