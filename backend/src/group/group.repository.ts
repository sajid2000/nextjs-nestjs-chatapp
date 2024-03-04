import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DB, DB_CONNECTION } from "@/db/db.module";
import * as dbTable from "@/db/schema";

import { CreateGroupDto } from "./group.dto";

@Injectable()
export class GroupRepository {
  constructor(@Inject(DB_CONNECTION) private db: DB) {}

  async findById(id: number) {
    return this.db.query.group.findFirst({ where: eq(dbTable.group.id, id) });
  }

  async create(data: CreateGroupDto & { creator: number; conversationId: number }) {
    const { name, image, creator, members, conversationId } = data;

    return this.db.transaction(async (tx) => {
      try {
        const group = (await tx.insert(dbTable.group).values({ name, image, creator, conversationId }).returning())[0];

        if (!group) throw new Error("Unable to create");

        await tx.insert(dbTable.groupMember).values(members.map((i) => ({ groupId: group.id, userId: i })));

        return group;
      } catch (error) {
        await tx.rollback();

        throw error;
      }
    });
  }

  async addGroupMemebers(groupId: number, members: number[]) {
    await this.db.insert(dbTable.groupMember).values(members.map((i) => ({ groupId, userId: i })));
  }

  async updateAndRetrive(id: number, data: Partial<typeof dbTable.group.$inferInsert>) {
    const res = await this.db.update(dbTable.group).set(data).where(eq(dbTable.group.id, id)).returning();

    if (res.length < 1) throw new Error("Unable to update");

    return res[0];
  }

  async delete(id: number) {
    return this.db.delete(dbTable.group).where(eq(dbTable.group.id, id));
  }
}
