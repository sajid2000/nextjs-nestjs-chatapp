import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";

import { CreateGroupDto } from "../dto/group.dto";
import { GroupRepository } from "../repositories/group.repository";

@Injectable()
export class GroupService {
  constructor(private readonly groupRepository: GroupRepository) {}

  async getById(groupId: number) {
    const res = await this.groupRepository.getAllMembersOfGroup(groupId);

    if (!res) throw new NotFoundException();

    return res;
  }

  async getAllMembersOfGroup(groupId: number) {
    return this.groupRepository.getAllMembersOfGroup(groupId);
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
