import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, gt, inArray, lt, or } from "drizzle-orm";

import { DB, DB_CONNECTION } from "@/db/db.module";
import * as dbTable from "@/db/schema";

import { UpdateMessageDto } from "../dto/message.dto";
import { MESSAGE_STATUS, MessageQueryParams } from "../types";

@Injectable()
export class MessageRepository {
  constructor(@Inject(DB_CONNECTION) private db: DB) {}

  async getAllMessageByConversation(conversationId: number, filter: MessageQueryParams) {
    const { limit = 15, cursor } = filter;

    return this.db.query.message.findMany({
      where: and(
        eq(dbTable.message.conversationId, conversationId),
        cursor ? lt(dbTable.message.id, cursor) : gt(dbTable.message.id, 0)
      ),
      limit,
      orderBy: desc(dbTable.message.id),
      with: {
        sender: {
          columns: {
            id: true,
            fullName: true,
            avatar: true,
            phone: true,
          },
        },
      },
    });
  }

  async create(data: typeof dbTable.message.$inferInsert) {
    return (await this.db.insert(dbTable.message).values(data).returning())[0];
  }

  async updateStatus({ conversationId, messageId, status }: UpdateMessageDto) {
    await this.db
      .update(dbTable.message)
      .set({ messageStatus: status })
      .where(and(eq(dbTable.message.id, messageId), eq(dbTable.message.conversationId, conversationId)));
  }

  async removeUserMessage(userId: number, messageId: number) {
    return (
      await this.db
        .delete(dbTable.message)
        .where(and(eq(dbTable.message.senderId, userId), eq(dbTable.message.id, messageId)))
        .returning()
    )[0];
  }

  async updateConversationMessagesStatus(conversationId: number, status: keyof typeof MESSAGE_STATUS) {
    const messageIds = await this.db
      .select({ id: dbTable.message.id })
      .from(dbTable.message)
      .where(
        and(
          eq(dbTable.message.conversationId, conversationId),
          status === "delivered"
            ? eq(dbTable.message.messageStatus, MESSAGE_STATUS.sent)
            : or(
                eq(dbTable.message.messageStatus, MESSAGE_STATUS.sent),
                eq(dbTable.message.messageStatus, MESSAGE_STATUS.delivered)
              )
        )
      );

    if (messageIds.length > 0) {
      await this.db
        .update(dbTable.message)
        .set({ messageStatus: status })
        .where(
          inArray(
            dbTable.message.id,
            messageIds.map((i) => i.id)
          )
        );
    }
  }
}
