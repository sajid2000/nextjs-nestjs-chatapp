import { createZodDto } from "nestjs-zod";

import { createConversationSchema } from "../validators/conversation.validator";

export class CreateConversationDto extends createZodDto(createConversationSchema) {}
