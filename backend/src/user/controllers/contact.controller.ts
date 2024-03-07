import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from "@nestjs/common";

import { JWTAuthGuard } from "@/auth/guards/jwt-auth.guard";

import { CreateContactDto } from "../dto/contact.dto";
import { ContactService } from "../services/contact.service";

@Controller("contacts")
@UseGuards(JWTAuthGuard)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  async getAllContactOfUser(@Req() req: Request) {
    return this.contactService.getAllContactOfUser(req.user.id);
  }

  @Post()
  async createContact(@Req() req: Request, @Body() dto: CreateContactDto) {
    return this.contactService.create({ phone: dto.phone, userId: req.user.id });
  }

  @Delete(":id")
  async removeContact(@Req() req: Request, @Param("id", ParseIntPipe) contactId: number) {
    return this.contactService.remove({ userId: req.user.id, contactId });
  }
}
