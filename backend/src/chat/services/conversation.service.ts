import { Injectable, NotFoundException } from "@nestjs/common";

import { CreateGroupDto } from "../dto/group.dto";
import { ThreadEntity } from "../entities/conversation.entity";
import { GroupInfoEntity } from "../entities/group.entity";
import { ConversationRepository } from "../repositories/conversation.repository";
import { GroupRepository } from "../repositories/group.repository";

type UserConversationFilter = {
  userId: number;
  conversationId: number;
};

type UserContactFilter = {
  userId: number;
  contactId: number;
};

@Injectable()
export class ConversationService {
  constructor(
    private groupRepository: GroupRepository,
    private conversationRepository: ConversationRepository
  ) {}

  async getAllConversationsIdOfUser(userId: number) {
    return this.conversationRepository.getAllConversationsIdOfUser(userId);
  }

  async getAllConversationOfUser(userId: number) {
    const groupConversation = await this.conversationRepository.getAllGroupConversationOfUserWithLastMessage(userId);
    const privateConversations = await this.conversationRepository.getAllPrivateConversationOfUserWithLastMessage(userId);

    const groupThreads = groupConversation.map(({ conversation, group, lastMessage }) => {
      return new ThreadEntity({
        id: conversation.id,
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

    const privateThreads = privateConversations.map((i) => {
      return new ThreadEntity({
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

    return [...groupThreads, ...privateThreads].sort((a, b) => {
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.sentDate).getTime() - new Date(a.lastMessage.sentDate).getTime();
      }

      return a.id - b.id;
    });
  }

  async getConversationWithDetails(dto: UserConversationFilter) {
    const conversation = await this.getConversationOfUser(dto);

    if (conversation.isGroup) {
      const group = await this.groupRepository.findByConversationId(conversation.id);

      if (!group) throw new NotFoundException();

      return new ThreadEntity({
        id: conversation.id,
        participantOrGroupId: group.id,
        isGroup: true,
        name: group.name,
        avatar: group.image,
        isDeleted: false,
        isOnline: false,
        lastSeen: new Date(),
      });
    } else {
      const participant = await this.getPrivateConversationParticipantOfUser(dto);

      return new ThreadEntity({
        id: conversation.id,
        participantOrGroupId: participant.id,
        isGroup: false,
        name: participant.fullName,
        avatar: participant.avatar,
        isDeleted: conversation.isDeleted,
        isOnline: participant.isOnline,
        lastSeen: participant.lastSeen,
      });
    }
  }

  async createPrivateConversation(dto: UserContactFilter) {
    try {
      const conversation = await this.getPrivateConversationBetweenTwoUser(dto);
      const { isDeleted, ...rest } = await this.getConversationOfUser({ userId: dto.userId, conversationId: conversation.id });

      if (isDeleted) {
        await this.conversationRepository.updateUserConversation(conversation.id, { isDeleted: false });
      }

      return rest;
    } catch (error) {
      if (error instanceof NotFoundException) {
        const createdConversation = await this.conversationRepository.createConversation({ isGroup: false });

        await this.conversationRepository.createManyUserConversation(createdConversation.id, [dto.userId, dto.contactId]);

        return createdConversation;
      }

      throw error;
    }
  }

  async getPrivateConversationParticipantOfUser(dto: UserConversationFilter) {
    const res = await this.conversationRepository.getPrivateConversationParticipantOfUser(dto);

    if (!res) throw new NotFoundException();

    return res;
  }

  async getPrivateConversationByContact(dto: UserContactFilter) {
    const conversation = await this.getPrivateConversationBetweenTwoUser(dto);
    const userConversation = await this.getConversationOfUser({ userId: dto.userId, conversationId: conversation.id });

    if (userConversation.isDeleted) throw new NotFoundException("Conversation not found!");

    return conversation;
  }

  async getPrivateConversationBetweenTwoUser({ contactId, userId }: UserContactFilter) {
    const conversation = await this.conversationRepository.getPrivateConversationBetweenTwoUser(userId, contactId);

    if (!conversation) throw new NotFoundException("Conversation not found!");

    return conversation;
  }

  async createGroupConversation(userId: number, dto: CreateGroupDto) {
    const conversation = await this.conversationRepository.createConversation({ isGroup: true });

    await this.conversationRepository.createManyUserConversation(conversation.id, [...dto.members, userId]);

    const group = await this.groupRepository.create({
      creator: userId,
      conversationId: conversation.id,
      name: dto.name,
      image: dto.image,
      members: [...dto.members, userId],
    });

    return {
      ...conversation,
      groupId: group.id,
    };
  }

  async getGroupConversationInfo(dto: UserConversationFilter) {
    const group = await this.getConversationGroupOfUser(dto);

    const members = await this.groupRepository.getAllMembersOfGroup(group.id);

    return new GroupInfoEntity({ ...group, members });
  }

  async getGroupMemberInfo(userId: number, dto: { conversationId: number; memberId: number }) {
    const group = await this.getConversationGroupOfUser({ userId, conversationId: dto.conversationId });
    const member = await this.groupRepository.getGroupMember({ groupId: group.id, memberId: dto.memberId });

    return member;
  }

  async deleteGroupConversation(dto: UserConversationFilter) {
    const conversation = await this.getConversationGroupOfUser(dto);

    return this.conversationRepository.removeConversation(conversation.id);
  }

  async removeUserConversation(dto: UserConversationFilter) {
    const conversation = await this.getConversationOfUser(dto);

    return this.conversationRepository.updateUserConversation(conversation.id, { isDeleted: true });
  }

  async addUserToConversation(dto: UserConversationFilter) {
    const conversation = await this.getConversationOfUser(dto);

    return this.conversationRepository.updateUserConversation(conversation.id, { isDeleted: false });
  }

  async getConversationOfUser(dto: UserConversationFilter) {
    const res = await this.conversationRepository.getConversationOfUser(dto);

    if (!res) throw new NotFoundException("Conversation not found!");

    return res;
  }

  private async getConversationGroupOfUser(dto: UserConversationFilter) {
    const conversation = await this.conversationRepository.getConversationOfUser(dto);

    if (!conversation || !conversation.isGroup) throw new NotFoundException("Conversation not found!");

    const group = await this.groupRepository.findByConversationId(dto.conversationId);

    if (!group) throw new NotFoundException("Conversation not found!");

    return group;
  }
}
