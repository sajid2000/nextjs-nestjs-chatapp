import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";

import { DB, DB_CONNECTION } from "@/db/db.module";
import * as dbTable from "@/db/schema";

import { CreateGroupDto } from "../dto/group.dto";

@Injectable()
export class GroupRepository {
  constructor(@Inject(DB_CONNECTION) private db: DB) {}

  async findById(id: number) {
    return this.db.query.group.findFirst({ where: eq(dbTable.group.id, id) });
  }

  async findByCreator({ groupId, userId }: { userId: number; groupId: number }) {
    return this.db.query.group.findFirst({ where: and(eq(dbTable.group.id, groupId), eq(dbTable.group.creator, userId)) });
  }

  async findByConversationId(conversationId: number) {
    return this.db.query.group.findFirst({ where: eq(dbTable.group.conversationId, conversationId) });
  }

  async findGroupMember({ groupId, userId }: { groupId: number; userId: number }) {
    return this.db.query.groupMember.findFirst({
      where: and(eq(dbTable.groupMember.userId, userId), eq(dbTable.groupMember.groupId, groupId)),
    });
  }

  async getGroupMemberDetails({ groupId, memberId }: { groupId: number; memberId: number }) {
    const data = await this.db
      .select({
        id: dbTable.user.id,
        fullName: dbTable.user.fullName,
        avatar: dbTable.user.avatar,
        phone: dbTable.user.phone,
      })
      .from(dbTable.user)
      .innerJoin(dbTable.groupMember, and(eq(dbTable.user.id, dbTable.groupMember.userId), eq(dbTable.user.id, memberId)))
      .innerJoin(dbTable.groupMember, and(eq(dbTable.group.id, dbTable.groupMember.groupId), eq(dbTable.group.id, groupId)))
      .limit(1);

    return data[0];
  }

  async getAllMembersOfGroup(groupId: number) {
    return this.db
      .select({
        id: dbTable.user.id,
        fullName: dbTable.user.fullName,
        phone: dbTable.user.phone,
        avatar: dbTable.user.avatar,
      })
      .from(dbTable.user)
      .innerJoin(
        dbTable.groupMember,
        and(eq(dbTable.user.id, dbTable.groupMember.userId), eq(dbTable.groupMember.groupId, groupId))
      );
  }

  async getAllGroupOfUser(userId: number) {
    return this.db.query.groupMember.findMany({
      where: eq(dbTable.groupMember.userId, userId),
      columns: {},
      with: { group: true },
    });
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

  async removeGroupMemeber({ groupId, userId }: { groupId: number; userId: number }) {
    await this.db
      .delete(dbTable.groupMember)
      .where(and(eq(dbTable.groupMember.groupId, groupId), eq(dbTable.groupMember.userId, userId)));
  }

  async updateAndRetrive(groupId: number, data: Partial<typeof dbTable.group.$inferInsert>) {
    const res = await this.db.update(dbTable.group).set(data).where(eq(dbTable.group.id, groupId)).returning();

    if (res.length < 1) throw new Error("Unable to update");

    return res[0];
  }
}
