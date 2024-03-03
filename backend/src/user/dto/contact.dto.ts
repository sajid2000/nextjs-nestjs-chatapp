import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const createContactSchema = z.object({
  phone: z.number(),
});

export class CreateContactDto extends createZodDto(createContactSchema) {}
