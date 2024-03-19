import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, inArray, not, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { DB, DB_CONNECTION } from "@/db/db.module";
import * as dbTable from "@/db/schema";

import { Thread } from "../types";

type UserConversationFilter = {
  userId: number;
  conversationId: number;
};

@Injectable()
export class ConversationRepository {
  constructor(@Inject(DB_CONNECTION) private db: DB) {}

  async createConversation(data: typeof dbTable.conversation.$inferInsert) {
    return (await this.db.insert(dbTable.conversation).values(data).returning())[0];
  }

  async getAllPrivateConversationOfUserWithLastMessage(userId: number) {
    /*
      select
        c.id, c.is_group
        , uc.user_id as contact_id, u.full_name as contact_name, u.avatar
        , m.id as last_message_id, m.message_content as last_message, m.sender_id as last_message_sender_id
        , m.message_type, m.message_status, m.sent_date as message_sent_date
      from conversation as c
        inner join user_conversation as uc on uc.conversation_id = c.id and uc.user_id != 1 and c.isGroup = false
        inner join "user" as u on u.id = uc.user_id
        left join lateral (
          select * from "message" where conversation_id = c.id order by id desc limit 1
        ) as m on c.id = m.conversation_id
      where c.id in (
        select conversation_id
        from user_conversation
        where user_id = ${userId} and is_deleted = false
      )
      order by c.id desc
    */
    const u = alias(dbTable.user, "u");
    const m = alias(dbTable.message, "m");
    const c = alias(dbTable.conversation, "c");
    const uc = alias(dbTable.userConversation, "uc");

    const result = await this.db.execute(sql`select
      ${c.id}, ${c.isGroup}, ${c.createdAt}, ${c.updatedAt},
      ${u.id} as "participantId", ${u.fullName} as "name" , ${u.avatar}, ${u.lastSeen} as "lastSeen", ${u.isOnline} as "isOnline",
      ${m.id} as "lastMessageId", ${m.messageContent} as "lastMessageContent",
      ${m.senderId} as "lastMessageSenderId" , ${m.messageType} as "lastMessageType",
      ${m.messageStatus} "lastMessageStatus", ${m.sentDate} as "lastMessageSentDate", ${m.deleteAt} as "lastMessageDeletedAt"
    from ${dbTable.conversation} as ${c}
      inner join ${dbTable.userConversation} as ${uc}
        on ${uc.conversationId} = ${c.id} and ${uc.userId} != ${userId} and ${c.isGroup} = false
      inner join ${dbTable.user} as ${u} on ${u.id} = ${uc.userId}
      left join lateral (
        select * from ${dbTable.message} where ${dbTable.message.conversationId} = ${c.id} order by id desc limit 1
      ) as ${m} on ${c.id} = ${m.conversationId}
    where ${c.id} in (
      select ${dbTable.userConversation.conversationId}
      from ${dbTable.userConversation}
      where ${dbTable.userConversation.userId} = ${userId} and ${dbTable.userConversation.isDeleted} = false
    )
    order by ${m.sentDate} desc`);

    return result.rows as unknown as Thread[];
  }

  async getAllConversationsIdOfUser(userId: number) {
    return this.db.query.userConversation.findMany({
      columns: { userId: false },
      where: eq(dbTable.userConversation.userId, userId),
    });
  }

  async findOneConversationByUser({ conversationId, userId }: UserConversationFilter) {
    const data = await this.db.query.userConversation.findFirst({
      where: and(eq(dbTable.userConversation.userId, userId), eq(dbTable.userConversation.conversationId, conversationId)),
      columns: { isDeleted: true },
      with: {
        conversation: true,
      },
    });

    return data ? { ...data.conversation, isDeleted: data.isDeleted } : undefined;
  }

  async findUserConversation({ conversationId, userId }: UserConversationFilter) {
    return this.db.query.userConversation.findFirst({
      where: and(eq(dbTable.userConversation.userId, userId), eq(dbTable.userConversation.conversationId, conversationId)),
    });
  }

  async getPrivateConversationParticipant({ conversationId, userId }: UserConversationFilter) {
    const res = await this.db.query.userConversation.findFirst({
      where: and(not(eq(dbTable.userConversation.userId, userId)), eq(dbTable.userConversation.conversationId, conversationId)),
      columns: {},
      with: { user: true },
    });

    if (!res) return null;

    return res.user;
  }

  async getPrivateConversationBetweenTwoUser(user1Id: number, user2Id: number) {
    /*
      select c.*
      from user_conversation uc
      inner join conversation c on uc.conversation_id = c.id and c.isGroup = false
      where uc.user_id in (1, 2)
      group by c.id
      having count(uc.user_id) = 2
    */

    const res = await this.db
      .select({
        id: dbTable.conversation.id,
        isGroup: dbTable.conversation.isGroup,
        createdAt: dbTable.conversation.createdAt,
        updatedAt: dbTable.conversation.updatedAt,
      })
      .from(dbTable.userConversation)
      .innerJoin(
        dbTable.conversation,
        and(eq(dbTable.conversation.id, dbTable.userConversation.conversationId), eq(dbTable.conversation.isGroup, false))
      )
      .where(inArray(dbTable.userConversation.userId, [user1Id, user2Id]))
      .groupBy(dbTable.conversation.id)
      .having(sql`count(${dbTable.userConversation.userId}) = 2`);

    if (res.length === 0) return null;

    return res[0];
  }

  async getAllGroupConversationOfUserWithLastMessage(userId: number) {
    const ids = await this.getAllConversationsIdOfUser(userId);
    const conversationsId = ids.filter((i) => !i.isDeleted).map((i) => i.conversationId);

    if (conversationsId.length === 0) return [];

    const data = await this.db.query.group.findMany({
      where: inArray(dbTable.group.conversationId, conversationsId),
      columns: {
        conversationId: false,
        createdAt: false,
        updatedAt: false,
      },
      with: {
        conversation: {
          with: {
            messages: {
              limit: 1,
              orderBy: desc(dbTable.message.id),
              columns: { conversationId: false },
            },
          },
        },
      },
    });

    return data.map(({ conversation: { messages, ...conversation }, ...group }) => ({
      group,
      conversation,
      lastMessage: messages[0],
    }));
  }

  async getGroupConversation(conversationId: number) {
    const data = await this.db.query.group.findFirst({
      where: eq(dbTable.group.conversationId, conversationId),
      with: { conversation: true },
    });

    if (!data) return undefined;

    const { conversation, ...group } = data;

    return { group, ...conversation };
  }

  async createManyUserConversation(conversationId: number, userIds: number[]) {
    await this.db.insert(dbTable.userConversation).values(userIds.map((i) => ({ conversationId, userId: i })));
  }

  async updateUserConversation(data: { conversationId: number; userId: number; isDeleted: boolean }) {
    await this.db
      .update(dbTable.userConversation)
      .set(data)
      .where(
        and(eq(dbTable.userConversation.conversationId, data.conversationId), eq(dbTable.userConversation.userId, data.userId))
      );
  }

  async removeUserConversation({ conversationId, userId }: UserConversationFilter) {
    await this.db
      .delete(dbTable.userConversation)
      .where(and(eq(dbTable.userConversation.userId, userId), eq(dbTable.userConversation.conversationId, conversationId)));
  }

  async removeConversation(conversationId: number) {
    await this.db.delete(dbTable.conversation).where(eq(dbTable.conversation.id, conversationId));
  }
}
