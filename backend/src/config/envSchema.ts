import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  APP_ENV: z.enum(["local", "development", "production", "test"]),
  APP_TIMEZONE: z.string().min(2),
  APP_LOCALE: z.string().min(2),
  SERVER_PORT: z.coerce.number(),
  // db
  DB_URL: z.string().min(2),
  DB_DRIVER: z.enum(["mysql2", "pg"]),
  // auth
  COOKIE_SECRET: z.string().min(10),
  BCRYPT_SALT: z.coerce.number(),
  JWT_ACCESS_TOKEN_SECRET: z.string().min(2),
  JWT_ACCESS_TOKEN_EXPIRES: z.coerce.number(),
  // upload thing config
  UPLOADTHING_SECRET: z.string().min(10),
  UPLOADTHING_APP_ID: z.string().min(10),
});

export const envVars = envSchema.parse(process.env);

declare global {
  type EnvVariables = typeof envVars;
}
