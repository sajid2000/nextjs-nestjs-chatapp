import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const createConversationSchema = z.object({
  contactId: z.number(),
  isGroup: z.boolean(),
});

export class CreateConversationDto extends createZodDto(createConversationSchema) {}
