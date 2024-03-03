import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const UpdatePasswordSchema = z.object({
  oldPassword: z.string().min(3),
  password: z.string().min(3),
  confirmPassword: z.string().min(3),
});

// export class UpdateProfileDto extends createZodDto(updateProfileSchema) {}

export class UpdatePasswordDto extends createZodDto(UpdatePasswordSchema) {}
