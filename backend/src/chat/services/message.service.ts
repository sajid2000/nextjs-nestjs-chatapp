import { Injectable, NotFoundException } from "@nestjs/common";

import { CreateMessageDto, UpdateMessageDto } from "../dto/message.dto";
import { MessageEntity } from "../entities/message.entity";
import { MessageRepository } from "../repositories/message.repository";
import { MESSAGE_STATUS, MessageQueryParams } from "../types";
import { ConversationService } from "./conversation.service";

@Injectable()
export class MessageService {
  constructor(
    private conversationService: ConversationService,
    private messageRepository: MessageRepository
  ) {}

  async getMessagesByConversationId(userId: number, conversationId: number, filter: MessageQueryParams) {
    const { limit, cursor } = filter;

    if (!(await this.conversationService.isMemberOfConversation({ userId, conversationId }))) {
      throw new NotFoundException();
    }

    const result = await this.messageRepository.getAllMessageByConversation(conversationId, filter);

    return {
      limit,
      nextCursor: result[result.length - 1]?.id ?? null,
      prevCursor: cursor ? Number(cursor) : null,
      result: result.map((i) => new MessageEntity(i)),
    };
  }

  async saveMessage(dto: CreateMessageDto) {
    const { conversationId, senderId, messageContent, messageType } = dto;

    const newMessage = await this.messageRepository.create({
      conversationId,
      senderId,
      messageContent,
      messageType,
      messageStatus: MESSAGE_STATUS.sent,
    });

    return new MessageEntity(newMessage);
  }

  async updateStatus(userId: number, dto: UpdateMessageDto) {
    if (!(await this.conversationService.isMemberOfConversation({ userId, conversationId: dto.conversationId }))) {
      throw new NotFoundException();
    }

    return await this.messageRepository.updateStatus(dto);
  }

  async updateConversationMessagesStatus(conversationId: number, status: keyof typeof MESSAGE_STATUS) {
    return this.messageRepository.updateConversationMessagesStatus(conversationId, status);
  }
}
