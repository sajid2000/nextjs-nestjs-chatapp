import { Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";

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

  async createGroupConversation(dto: { members: number[] }) {
    const conversation = (await this.conversationRepository.createGroupConversation())[0];

    if (!conversation) throw new UnprocessableEntityException();

    await this.conversationRepository.createManyUserConversation(conversation.id, dto.members);

    return conversation;
  }

  async createOrGetPrivateConversation(dto: CreateConversationDto & { userId: number }) {
    const exists = await this.conversationRepository.getConversationOfTwoUser(dto.userId, dto.contactId);

    if (exists) return exists;

    return this.conversationRepository.createPrivateConversation(dto);
  }

  async getUserConversationThreads(userId: number) {
    const privateConversations = await this.conversationRepository.getUserPrivateConversations(userId);

    const groupConversation = await this.conversationRepository.getUserGroupConversationList(userId);

    const groupChat = groupConversation.map(({ group }) => {
      const lastMessage = group.conversation.messages[0];
      return new ChatThreadEntity({
        id: group.conversation.id,
        name: group.name,
        avatar: group.image,
        isGroup: true,
        isDeleted: false,
        isOnline: false,
        lastSeen: new Date(),
        participantOrGroupId: group.id,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              senderId: lastMessage.senderId,
              messageContent: lastMessage.messageContent,
              messageStatus: lastMessage.messageStatus,
              messageType: lastMessage.messageType,
              sentDate: lastMessage.sentDate,
              deleteAt: lastMessage.deleteAt,
            }
          : undefined,
      });
    });

    const privateChat = privateConversations.map((i) => {
      return new ChatThreadEntity({
        id: i.id,
        name: i.name,
        avatar: i.avatar,
        isGroup: i.isGroup,
        isDeleted: false,
        isOnline: i.isOnline,
        lastSeen: new Date(i.lastSeen),
        participantOrGroupId: i.participantId,
        lastMessage: {
          id: i.lastMessageId,
          messageContent: i.lastMessageContent,
          senderId: i.lastMessageSenderId,
          messageStatus: i.lastMessageStatus,
          messageType: i.lastMessageType,
          sentDate: new Date(i.lastMessageSentDate),
          deleteAt: i.lastMessageDeletedAt,
        },
      });
    });

    return [...groupChat, ...privateChat].sort((a, b) => {
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.sentDate).getTime() - new Date(a.lastMessage.sentDate).getTime();
      }

      return a.id - b.id;
    });
  }

  async getUserConversationList(userId: number) {
    return this.conversationRepository.getUserConversationList(userId);
  }

  async getUserConversation(dto: { userId: number; conversationId: number }) {
    const res = await this.conversationRepository.getUserConversation(dto);

    if (!res) throw new NotFoundException("Conversation not found!");

    if (res.conversation.isGroup) {
      const group = await this.conversationRepository.getConversationGroup(res.conversation.id);

      if (!group) throw new NotFoundException();

      return new ConversationEntity({
        id: res.conversation.id,
        isGroup: true,
        name: group.name,
        avatar: group.image,
        isDeleted: false,
        participantOrGroupId: group.id,
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

    if (res.isDeleted) await this.conversationRepository.updateUserConversation({ ...dto, isDeleted: false });
  }
}
