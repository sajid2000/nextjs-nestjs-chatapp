import { createZodDto } from "nestjs-zod";

import { createMessageSchema, updateMessageSchema } from "../validators/message.validator";

export class CreateMessageDto extends createZodDto(createMessageSchema) {}

export class UpdateMessageDto extends createZodDto(updateMessageSchema) {}
