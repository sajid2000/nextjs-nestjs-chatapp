import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";

import { DB, DB_CONNECTION } from "@/db/db.module";
import * as dbTable from "@/db/schema";

@Injectable()
export class ContactRepository {
  constructor(@Inject(DB_CONNECTION) private db: DB) {}

  async findUserContact(data: { userId: number; contactId: number }) {
    return this.db.query.userContact.findFirst({
      where: and(eq(dbTable.userContact.userId, data.userId), eq(dbTable.userContact.contactId, data.contactId)),
      with: { contact: true },
    });
  }

  async findAllByUserId(userId: number) {
    return this.db.query.userContact.findMany({
      where: eq(dbTable.userContact.userId, userId),
      with: {
        contact: {
          columns: {
            id: true,
            avatar: true,
            fullName: true,
            lastSeen: true,
            isOnline: true,
            phone: true,
          },
        },
      },
    });
  }

  async create(data: typeof dbTable.userContact.$inferInsert) {
    const res = await this.db.insert(dbTable.userContact).values(data).returning();

    if (res.length < 1) throw new Error("Unable to create contact");

    return res[0];
  }

  async delete(data: { userId: number; contactId: number }) {
    return this.db
      .delete(dbTable.userContact)
      .where(and(eq(dbTable.userContact.userId, data.userId), eq(dbTable.userContact.contactId, data.contactId)));
  }
}
