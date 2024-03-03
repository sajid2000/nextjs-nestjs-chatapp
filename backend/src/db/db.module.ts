import { Global, Module } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { dbConfig } from "@/config";

import * as schema from "./schema";

export type DB = NodePgDatabase<typeof schema>;

export const DB_CONNECTION = "DB_CONNECTION";

@Global()
@Module({
  providers: [
    {
      provide: DB_CONNECTION,
      inject: [dbConfig.KEY],
      useFactory: async (dbconfig: ConfigType<typeof dbConfig>) => {
        const pool = new Pool({
          connectionString: dbconfig.url,
        });

        return drizzle(pool, { schema });
      },
    },
  ],
  exports: [DB_CONNECTION],
})
export class DbModule {}
