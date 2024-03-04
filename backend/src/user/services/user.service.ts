import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import * as bcrypt from "bcryptjs";

import { RegisterDto } from "@/auth/dto/auth.dto";
import { ValidationException } from "@/common/Exceptions/ValidationException";
import { authConfig } from "@/config";

import { UpdatePasswordDto } from "../dto/profile.dto";
import { UserEntity } from "../entities/user.entity";
import { UserRepository } from "../repositories/user.repository";

@Injectable()
export class UserService {
  constructor(
    @Inject(authConfig.KEY) private authConf: ConfigType<typeof authConfig>,
    private readonly userRepository: UserRepository
  ) {}

  async findById(id: number) {
    const data = await this.userRepository.findById(id);

    if (!data) throw new NotFoundException();

    return new UserEntity(data);
  }

  async findByPhone(phone: number) {
    const data = await this.userRepository.findByPhone(phone);

    if (!data) throw new NotFoundException();

    return new UserEntity(data);
  }

  async create(dto: RegisterDto) {
    const existedUser = await this.userRepository.findByPhone(dto.phone);

    if (existedUser) throw new ValidationException("phone", "Already exists");

    const newUser = await this.userRepository.create({
      ...dto,
      isOnline: false,
      password: bcrypt.hashSync(dto.password ?? "", this.authConf.bcryptSalt),
    });

    return new UserEntity(newUser);
  }

  async update(userId: number, dto: Partial<UserEntity>) {
    const data = await this.userRepository.updateAndRetrive(userId, {
      ...dto,
      password: dto.password ? bcrypt.hashSync(dto.password, this.authConf.bcryptSalt) : undefined,
      lastSeen: dto.lastSeen,
    });

    return new UserEntity(data);
  }

  async updateAccountPassword(userId: number, dto: UpdatePasswordDto) {
    const user = await this.findById(userId);

    if (!bcrypt.compareSync(dto.oldPassword, user.password ?? "")) {
      throw new ValidationException("oldPassword", "Invalid password");
    }

    return this.update(userId, { password: dto.password });
  }

  async remove(id: number) {
    return this.userRepository.delete(id);
  }
}
