import * as z from "zod";

export const LoginSchema = z.object({
  phone: z.number(),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});
export type LoginPayload = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  phone: z.number(),
  avatar: z.string().optional(),
  password: z.string().min(6, {
    message: "Minimum 6 characters required",
  }),
  fullName: z.string().min(1, {
    message: "Name is required",
  }),
});
export type RegisterPayload = z.infer<typeof RegisterSchema>;
