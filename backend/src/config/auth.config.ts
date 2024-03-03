import { registerAs } from "@nestjs/config";

import { envVars } from "./envSchema";

export default registerAs("auth", () => ({
  cookieSecret: envVars.COOKIE_SECRET,
  bcryptSalt: envVars.BCRYPT_SALT,
  accessTokenSecret: envVars.JWT_ACCESS_TOKEN_SECRET,
  accessTokenExpires: envVars.JWT_ACCESS_TOKEN_EXPIRES,
}));
