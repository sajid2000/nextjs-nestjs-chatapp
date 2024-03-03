import { UnprocessableEntityException, ValidationError, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as cookieParser from "cookie-parser";
import { createRouteHandler } from "uploadthing/express";

import { AppModule } from "./app.module";
import { uploadRouter } from "./common/uploadthing";
import { envVars } from "./config/envSchema";
import { UserEntity } from "./user/entities/user.entity";

declare global {
  interface Request extends Express.Request {
    user: Pick<UserEntity, "id" | "phone" | "avatar" | "fullName">;
    cookies: any;
  }

  interface Response extends Express.Response {
    cookie: Function;
    clearCookie: Function;
  }
}

function classValidatorErrFormat(err: ValidationError) {
  if (err.children && err.children.length > 0) {
    return {
      field: err.property,
      error: err.constraints?.nestedValidation
        ? err.constraints.nestedValidation
        : err.children.map((i) => classValidatorErrFormat(i)),
      // : err.children.map(({property, ...rest}) => classValidatorErrFormat({...rest, property: `${err.property}.${property}`}))
    };
  } else {
    return {
      field: err.property,
      // parent: err.property.split(".").length > 1 ? err.property.split(".")[0] : null,
      error: Object.values(err.constraints ?? {}).join(", "),
    };
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "debug"],
  });

  app.enableCors({
    credentials: true,
    origin: ["http://localhost:3000"],
  });

  // @ts-ignore
  app.use(cookieParser(envVars.COOKIE_SECRET, { httpOnly: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[] = []) => {
        return new UnprocessableEntityException({
          message: "Validation failed!",
          fields: errors.map(classValidatorErrFormat),
        });
      },
      // set to "true" if need to filter unwanted req body
      whitelist: false,
    })
  );

  app.use(
    "/api/uploadthing",
    createRouteHandler({
      router: uploadRouter,
      config: {
        uploadthingId: envVars.UPLOADTHING_APP_ID,
        uploadthingSecret: envVars.UPLOADTHING_SECRET,
        isDev: envVars.APP_ENV === "development",
      },
    })
  );

  await app.listen(envVars.SERVER_PORT);
}
bootstrap();
