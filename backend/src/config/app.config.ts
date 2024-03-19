import { registerAs } from "@nestjs/config";

import { envVars } from "./envSchema";

export default registerAs("app", () => ({
  env: envVars.APP_ENV,
  port: envVars.SERVER_PORT,
  timezone: envVars.APP_TIMEZONE,
  locale: envVars.APP_LOCALE,
}));
