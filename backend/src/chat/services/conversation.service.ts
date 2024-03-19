import { Injectable, NotFoundException } from "@nestjs/common";

import { CreateGroupDto } from "../dto/group.dto";
import { ConversationEntity } from "../entities/conversation.entity";
import { GroupEntity } from "../entities/group.entity";
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
      return new ConversationEntity({
        id: conversation.id,
        name: group.name,
        avatar: group.image,
        isGroup: true,
        isDeleted: false,
        isOnline: false,
        lastSeen: new Date(),
        participantOrGroupId: group.id,
        lastMessage: {
          id: lastMessage?.id,
          senderId: lastMessage?.senderId,
          messageContent: lastMessage?.messageContent,
          messageStatus: lastMessage?.messageStatus,
          messageType: lastMessage?.messageType,
          sentDate: new Date(lastMessage?.sentDate ?? conversation.createdAt),
          deleteAt: lastMessage?.deleteAt,
        },
      });
    });

    const privateThreads = privateConversations.map((i) => {
      return new ConversationEntity({
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
          sentDate: new Date(i.lastMessageSentDate ?? i.createdAt),
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

      return new ConversationEntity({
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
      const participant = await this.getPrivateConversationParticipant(dto);

      return new ConversationEntity({
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
        await this.conversationRepository.updateUserConversation({
          conversationId: conversation.id,
          userId: dto.userId,
          isDeleted: false,
        });
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

  async getPrivateConversationParticipant(dto: UserConversationFilter) {
    const res = await this.conversationRepository.getPrivateConversationParticipant(dto);

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

  async getGroupInfo(dto: UserConversationFilter) {
    const conversation = await this.conversationRepository.findOneConversationByUser(dto);

    if (!conversation || !conversation.isGroup) throw new NotFoundException("Conversation not found!");

    const group = await this.groupRepository.findByConversationId(dto.conversationId);

    if (!group) throw new NotFoundException("Conversation not found!");

    const members = await this.groupRepository.getAllMembersOfGroup(group.id);

    return new GroupEntity({ ...group, members });
  }

  async getGroupMember(dto: { groupId: number; memberId: number }) {
    return this.groupRepository.getGroupMemberDetails(dto);
  }

  async deleteGroup(dto: { userId: number; groupId: number }) {
    const group = await this.groupRepository.findByCreator(dto);

    if (!group) throw new NotFoundException("Group not found");

    return this.conversationRepository.removeConversation(group.conversationId);
  }

  async softDeleteUserConversation(dto: UserConversationFilter) {
    await this.conversationRepository.updateUserConversation({ ...dto, isDeleted: true });
  }

  async removeUserConversation(dto: UserConversationFilter) {
    await this.conversationRepository.removeUserConversation(dto);
  }

  async addUserToConversation(dto: UserConversationFilter) {
    return this.conversationRepository.updateUserConversation({ ...dto, isDeleted: false });
  }

  async isMemberOfConversation(dto: UserConversationFilter) {
    const res = await this.conversationRepository.findUserConversation(dto);

    if (!res || res.isDeleted) return false;

    return true;
  }

  async bannGroupMember(userId: number, dto: { conversationId: number; memberId: number }) {
    const group = await this.groupRepository.findByConversationId(dto.conversationId);

    if (group?.creator !== userId) throw new NotFoundException();

    await this.groupRepository.removeGroupMemeber({ groupId: group.id, userId: dto.memberId });

    await this.conversationRepository.removeUserConversation({ conversationId: dto.conversationId, userId: dto.memberId });
  }

  private async getConversationOfUser(dto: UserConversationFilter) {
    const res = await this.conversationRepository.findOneConversationByUser(dto);

    if (!res) throw new NotFoundException("Conversation not found!");

    return res;
  }
}
