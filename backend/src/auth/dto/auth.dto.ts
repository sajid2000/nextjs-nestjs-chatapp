import { createZodDto } from "nestjs-zod";
import * as z from "zod";

export const LoginSchema = z.object({
  phone: z.number(),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

export const RegisterSchema = z.object({
  phone: z.number(),
  avatar: z.string().optional(),
  password: z.string().min(6, {
    message: "Minimum 6 characters required",
  }),
  fullName: z.string().min(1, {
    message: "Full Name is required",
  }),
});

export class LoginDto extends createZodDto(LoginSchema) {}

export class RegisterDto extends createZodDto(RegisterSchema) {}
