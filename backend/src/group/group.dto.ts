import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(2),
  image: z.string().optional(),
  members: z.number().array().nonempty(),
});

export class CreateGroupDto extends createZodDto(createGroupSchema) {}
