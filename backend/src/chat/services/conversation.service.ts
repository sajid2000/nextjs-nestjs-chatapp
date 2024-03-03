import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";

import { UserService } from "@/user/services/user.service";

import { CreateConversationDto } from "../dto/conversation.dto";
import { ChatThreadEntity, ConversationEntity } from "../entities/conversation.entity";
import { ConversationRepository } from "../repositories/conversation.repository";

@Injectable()
export class ConversationService {
  constructor(
    private userService: UserService,
    private conversationRepository: ConversationRepository
  ) {}

  async createConversation(dto: CreateConversationDto & { userId: number }) {
    const conversationExist = await this.conversationRepository.getConversationOfTwoUser(dto.userId, dto.contactId);

    if (conversationExist) throw new ConflictException("Conversation already exists!");

    return this.conversationRepository.createConversation(dto);
  }

  async getUserConversationThreads(userId: number) {
    const res = await this.conversationRepository.getUserConversationThread(userId);

    return res.map(
      ({
        id,
        name,
        avatar,
        isGroup,
        isOnline,
        participantId,
        lastSeen,
        lastMessageContent,
        lastMessageId,
        lastMessageSenderId,
        lastMessageSentDate,
        lastMessageStatus,
        lastMessageType,
        lastMessageDeletedAt,
      }) =>
        new ChatThreadEntity({
          id,
          name,
          avatar,
          isGroup,
          isOnline,
          participantOrGroupId: participantId,
          lastSeen,
          isDeleted: false,
          lastMessage: {
            id: lastMessageId,
            messageContent: lastMessageContent,
            senderId: lastMessageSenderId,
            messageStatus: lastMessageStatus,
            messageType: lastMessageType,
            sentDate: lastMessageSentDate,
            deleteAt: lastMessageDeletedAt,
          },
        })
    );
  }

  async getUserConversationList(userId: number) {
    return this.conversationRepository.getUserConversationList(userId);
  }

  async getUserConversation(dto: { userId: number; conversationId: number }) {
    const res = await this.conversationRepository.getUserConversation(dto);

    if (!res) throw new NotFoundException("Conversation not found!");

    if (res.conversation.isGroup) {
      return new ConversationEntity({
        id: res.conversation.id,
        isGroup: true,
        name: "group name",
        avatar: "group avatar",
        isDeleted: res.isDeleted,
        participantOrGroupId: 0,
        isOnline: false,
        lastSeen: new Date(),
      });
    } else {
      const participantId = await this.conversationRepository.getConversationParticipantId(dto);

      if (!participantId) throw new NotFoundException("Participant not found");

      const participant = await this.userService.findById(participantId);

      return new ConversationEntity({
        id: res.conversation.id,
        isGroup: false,
        name: participant.fullName,
        avatar: participant.avatar,
        isDeleted: res.isDeleted,
        isOnline: participant.isOnline,
        lastSeen: participant.lastSeen,
        participantOrGroupId: participant.id,
      });
    }
  }

  async getConversationOfTwoUser(user1Id: number, user2Id: number) {
    const res = await this.conversationRepository.getConversationOfTwoUser(user1Id, user2Id);

    if (!res) throw new NotFoundException("Conversation not found!");

    return res;
  }

  // async removeUserFromConversation(dto: { userId: number; conversationId: number }) {
  //   return this.conversationRepository.removeUserFromConversation(dto);
  // }

  async addUserToConversation(dto: { userId: number; conversationId: number }) {
    const res = await this.conversationRepository.getUserConversation(dto);

    if (!res) throw new NotFoundException("Conversation not found!");

    if (res.isDeleted) await this.conversationRepository.addUserToConversation(dto);
  }
}
