import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";

import { CreateGroupDto } from "../dto/group.dto";
import { GroupRepository } from "../repositories/group.repository";

@Injectable()
export class GroupService {
  constructor(private readonly groupRepository: GroupRepository) {}

  async getByConversationId(conversationId: number) {
    const res = await this.groupRepository.findByConversationId(conversationId);

    if (!res) throw new NotFoundException();

    return res;
  }

  async getAllMembersOfGroup(groupId: number) {
    return this.groupRepository.getAllMembersOfGroup(groupId);
  }

  async getAllGroupOfUser(userId: number) {
    return this.groupRepository.getAllGroupOfUser(userId);
  }

  async isGroupMember(dto: { groupId: number; userId: number }) {
    const groupMember = await this.groupRepository.findGroupMember(dto);

    if (!groupMember) return false;

    return true;
  }

  async remvoeGroupMember(dto: { groupId: number; userId: number }) {
    await this.groupRepository.removeGroupMemeber(dto);
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
}
