import { ClassSerializerInterceptor, Module, UnprocessableEntityException } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { createZodValidationPipe } from "nestjs-zod";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { ChatModule } from "./chat/chat.module";
import { appConfig, authConfig, dbConfig } from "./config";
import { DbModule } from "./db/db.module";
import { GroupModule } from "./group/group.module";
import { UserModule } from "./user/user.module";

const MyZodValidationPipe = createZodValidationPipe({
  createValidationException({ formErrors }) {
    return new UnprocessableEntityException({
      message: "Validation failed!",
      fields: Object.keys(formErrors.fieldErrors).map((i) => ({
        field: i,
        error: formErrors.fieldErrors[i]?.join(", "),
      })),
    });
  },
});

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: false,
      isGlobal: true,
      load: [appConfig, dbConfig, authConfig],
    }),
    DbModule,
    UserModule,
    AuthModule,
    ChatModule,
    GroupModule,
  ],
  providers: [
    AppService,
    { provide: APP_PIPE, useClass: MyZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
  controllers: [AppController],
})
export class AppModule {}
