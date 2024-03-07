import { Injectable } from "@nestjs/common";

import { ValidationException } from "@/common/Exceptions/ValidationException";

import { CreateContactDto } from "../dto/contact.dto";
import { ContactEntity } from "../entities/contact.entity";
import { ContactRepository } from "../repositories/contact.repository";
import { UserRepository } from "../repositories/user.repository";

@Injectable()
export class ContactService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly contactRepository: ContactRepository
  ) {}

  async getAllContactOfUser(userId: number) {
    const res = await this.contactRepository.findAllByUserId(userId);

    return res.map((i) => new ContactEntity(i.contact));
  }

  async create(dto: CreateContactDto & { userId: number }) {
    const contact = await this.userRepository.findByPhone(dto.phone);

    if (!contact || contact.id === dto.userId) throw new ValidationException("phone", "Contact not found!");

    const existedItem = await this.contactRepository.findUserContact({ contactId: contact.id, userId: dto.userId });

    if (existedItem) throw new ValidationException("phone", "Already exists");

    return this.contactRepository.create({
      contactId: contact.id,
      userId: dto.userId,
    });
  }

  async remove(dto: { userId: number; contactId: number }) {
    return this.contactRepository.delete(dto);
  }
}
