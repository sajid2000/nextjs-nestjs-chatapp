import { Inject, Injectable } from "@nestjs/common";
import { and, eq, inArray, not, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { DB, DB_CONNECTION } from "@/db/db.module";
import * as dbTable from "@/db/schema";

import { ConversationList } from "../types";

@Injectable()
export class ConversationRepository {
  constructor(@Inject(DB_CONNECTION) private db: DB) {}

  async createConversation(data: { userId: number; contactId: number; isGroup: boolean }) {
    const { userId, contactId, isGroup } = data;

    return await this.db.transaction(async (tx) => {
      try {
        const newConversation = (await tx.insert(dbTable.conversation).values({ isGroup }).returning())[0];

        // insert data to "userConversation" junction table
        await tx.insert(dbTable.userConversation).values([
          { conversationId: newConversation.id, userId },
          { conversationId: newConversation.id, userId: contactId },
        ]);

        return newConversation;
      } catch (error) {
        await tx.rollback();
      }
    });
  }

  async getUserConversationThread(userId: number) {
    /*
      select
        c.id, c.is_group
        , uc.user_id as contact_id, u.full_name as contact_name, u.avatar
        , m.id as last_message_id, m.message_content as last_message, m.sender_id as last_message_sender_id
        , m.message_type, m.message_status, m.sent_date as message_sent_date
      from conversation as c
        inner join user_conversation as uc on uc.conversation_id = c.id and uc.user_id != 1
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
      ${c.id}, ${c.isGroup} as "isGroup",
      ${u.id} as "participantId", ${u.fullName} as "name" , ${u.avatar}, ${u.lastSeen} as "lastSeen", ${u.isOnline} as "isOnline",
      ${m.id} as "lastMessageId", ${m.messageContent} as "lastMessageContent",
      ${m.senderId} as "lastMessageSenderId" , ${m.messageType} as "lastMessageType",
      ${m.messageStatus} "lastMessageStatus", ${m.sentDate} as "lastMessageSentDate", ${m.deleteAt} as "lastMessageDeletedAt"
    from ${dbTable.conversation} as ${c}
      inner join ${dbTable.userConversation} as ${uc}
        on ${uc.conversationId} = ${c.id} and ${uc.userId} != ${userId}
      inner join ${dbTable.user} as ${u} on ${u.id} = ${uc.userId}
      left join lateral (
        select * from ${dbTable.message} where ${dbTable.message.conversationId} = ${c.id} order by id desc limit 1
      ) as ${m} on ${c.id} = ${m.conversationId}
    where ${c.id} in (
      select ${dbTable.userConversation.conversationId}
      from ${dbTable.userConversation}
      where ${dbTable.userConversation.userId} = ${userId} and ${dbTable.userConversation.isDeleted} = false
    )
    order by ${c.id} desc`);

    return result.rows as unknown as ConversationList[];
  }

  async getUserConversationList(userId: number) {
    return this.db.query.userConversation.findMany({
      columns: { userId: false },
      where: eq(dbTable.userConversation.userId, userId),
    });
  }

  async getUserConversation({ conversationId, userId }: { userId: number; conversationId: number }) {
    return this.db.query.userConversation.findFirst({
      where: and(eq(dbTable.userConversation.userId, userId), eq(dbTable.userConversation.conversationId, conversationId)),
      columns: { isDeleted: true },
      with: {
        conversation: true,
      },
    });
  }

  async getConversationParticipantId({ conversationId, userId }: { userId: number; conversationId: number }) {
    const res = await this.db.query.userConversation.findFirst({
      where: and(not(eq(dbTable.userConversation.userId, userId)), eq(dbTable.userConversation.conversationId, conversationId)),
    });

    if (!res) return null;

    return res.userId;
  }

  async getConversationOfTwoUser(user1Id: number, user2Id: number) {
    /*
      select c.*
      from user_conversation uc
      inner join conversation c on uc.conversation_id = c.id
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
      .innerJoin(dbTable.conversation, eq(dbTable.conversation.id, dbTable.userConversation.conversationId))
      .where(inArray(dbTable.userConversation.userId, [user1Id, user2Id]))
      .groupBy(dbTable.conversation.id)
      .having(sql`count(${dbTable.userConversation.userId}) = 2`);

    if (res.length === 0) return null;

    return res[0];
  }

  async addUserToConversation({ conversationId, userId }: { userId: number; conversationId: number }) {
    await this.db
      .update(dbTable.userConversation)
      .set({ isDeleted: false })
      .where(and(eq(dbTable.userConversation.userId, userId), eq(dbTable.userConversation.conversationId, conversationId)));
  }

  async removeUserFromConversation({ conversationId, userId }: { userId: number; conversationId: number }) {
    await this.db
      .update(dbTable.userConversation)
      .set({ isDeleted: true })
      .where(and(eq(dbTable.userConversation.userId, userId), eq(dbTable.userConversation.conversationId, conversationId)));
  }
}
