import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, eq, sql } from "drizzle-orm";

import { DB, DB_CONNECTION } from "@/db/db.module";
import * as dbTable from "@/db/schema";

@Injectable()
export class UserRepository {
  constructor(@Inject(DB_CONNECTION) private db: DB) {}

  async findById(userId: number) {
    return this.db.query.user.findFirst({
      where: eq(dbTable.user.id, userId),
    });
  }

  async findByPhone(phone: number) {
    return this.db.query.user.findFirst({
      where: and(eq(dbTable.user.phone, phone)),
    });
  }

  async countAll() {
    const res = await this.db.select({ count: sql<number>`count(*)` }).from(dbTable.user);

    return res.length > 0 ? Number(res[0]?.count) : 0;
  }

  async create(data: typeof dbTable.user.$inferInsert) {
    const res = await this.db.insert(dbTable.user).values(data).returning();

    if (res.length < 1) throw new Error("Unable to create user");

    return res[0];
  }

  async updateAndRetrive(userId: number, data: Partial<typeof dbTable.user.$inferInsert>) {
    const res = await this.db.update(dbTable.user).set(data).where(eq(dbTable.user.id, userId)).returning();

    if (res.length < 1) throw new NotFoundException("User not found");

    return res[0];
  }

  async delete(userId: number) {
    return this.db.delete(dbTable.user).where(eq(dbTable.user.id, userId));
  }
}
