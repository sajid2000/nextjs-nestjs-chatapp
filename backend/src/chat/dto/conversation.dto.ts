import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const createConversationSchema = z.object({
  contactId: z.number(),
});

export class CreateConversationDto extends createZodDto(createConversationSchema) {}
