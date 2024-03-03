import { Exclude } from "class-transformer";

import { AbstractEntity } from "@/common/abstract.entity";

export class UserEntity extends AbstractEntity<UserEntity> {
  fullName: string;

  phone: number;

  @Exclude()
  password: string;

  avatar: string | null;

  isOnline: boolean;

  lastSeen: Date;
}
