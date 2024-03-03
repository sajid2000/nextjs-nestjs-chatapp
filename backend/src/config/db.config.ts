import { registerAs } from "@nestjs/config";

import { envVars } from "./envSchema";

export default registerAs("database", () => ({
  driver: envVars.DB_DRIVER,
  url: envVars.DB_URL,
}));
