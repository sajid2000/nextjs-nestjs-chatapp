import { Module } from "@nestjs/common";

import { ContactController } from "./controllers/contact.controller";
import { ProfileController } from "./controllers/profile.controller";
import { ContactRepository } from "./repositories/contact.repository";
import { UserRepository } from "./repositories/user.repository";
import { ContactService } from "./services/contact.service";
import { UserService } from "./services/user.service";

@Module({
  controllers: [ContactController, ProfileController],
  providers: [UserService, UserRepository, ContactService, ContactRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
