import { ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";

import { ConversationService } from "@/chat/services/conversation.service";

import { CreateGroupDto } from "./group.dto";
import { GropuConversationEntity } from "./group.entity";
import { GroupRepository } from "./group.repository";

@Injectable()
export class GroupService {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly groupRepository: GroupRepository
  ) {}

  async getById(id: number) {
    const res = await this.groupRepository.findById(id);

    if (!res) throw new NotFoundException();

    return res;
  }

  async create(userId: number, dto: CreateGroupDto) {
    const conversation = await this.conversationService.createGroupConversation({ members: [...dto.members, userId] });

    const group = await this.groupRepository.create({
      name: dto.name,
      image: dto.image,
      members: [...dto.members, userId],
      creator: userId,
      conversationId: conversation.id,
    });

    if (!group) throw new UnprocessableEntityException();

    return new GropuConversationEntity({
      groupId: group.id,
      conversationId: conversation.id,
      name: group.name,
      image: group.image,
    });
  }

  async update(userId: number, dto: Partial<CreateGroupDto> & { groupId: number }) {
    const { groupId, name, image, members } = dto;

    const exists = await this.groupRepository.findById(groupId);

    if (!exists) throw new NotFoundException();

    if (exists.creator !== userId) throw new ForbiddenException();

    if (members && members.length > 0) {
      await this.groupRepository.addGroupMemebers(groupId, members);
    }

    return this.groupRepository.updateAndRetrive(groupId, { name: name ?? undefined, image: image ?? undefined });
  }

  async remove({ userId, groupId }: { userId: number; groupId: number }) {
    const exists = await this.groupRepository.findById(groupId);

    if (!exists) throw new NotFoundException();

    if (exists.creator !== userId) throw new ForbiddenException();

    return this.groupRepository.delete(groupId);
  }
}
