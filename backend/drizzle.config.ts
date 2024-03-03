import type { Config } from "drizzle-kit";

import { envVars } from "./src/config/envSchema";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  driver: envVars.DB_DRIVER,
  dbCredentials: {
    connectionString: envVars.DB_URL,
  },
  strict: true,
} satisfies Config;