import { Injectable } from "@nestjs/common";

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

    const conversation = await this.conversationService.getConversationOfUser({ userId, conversationId });

    const result = await this.messageRepository.getAllMessageByConversation(conversation.id, filter);

    return {
      limit,
      nextCursor: result[result.length - 1]?.id ?? null,
      prevCursor: cursor ?? null,
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
    await this.conversationService.getConversationOfUser({ userId, conversationId: dto.conversationId });

    return await this.messageRepository.updateStatus(dto);
  }

  async updateConversationMessagesStatus(conversationId: number, status: keyof typeof MESSAGE_STATUS) {
    return this.messageRepository.updateConversationMessagesStatus(conversationId, status);
  }
}
