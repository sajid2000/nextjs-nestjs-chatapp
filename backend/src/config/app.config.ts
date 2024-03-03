import { registerAs } from "@nestjs/config";

import { envVars } from "./envSchema";

export default registerAs("app", () => ({
  name: envVars.NEXT_PUBLIC_APP_NAME,
  env: envVars.APP_ENV,
  appUrl: envVars.NEXT_PUBLIC_APP_URL,
  port: envVars.SERVER_PORT,
  timezone: envVars.APP_TIMEZONE,
  locale: envVars.APP_LOCALE,
}));
