import { UserRole } from "@prisma/client";
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
  code: z.string().length(6).optional(),
});

export const RegisterSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  password: z.string().min(6, { message: "Minimun 6 characters required" }),
  name: z.string().min(1, { message: "Name is Required" }),
});

export const ResetSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
});

export const NewPasswordSchema = z.object({
  password: z.string().min(6, { message: "Minimun 6 characters required" }),
});

export const SettingSchema = z
  .object({
    name: z.string().optional(),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.enum([UserRole.ADMIN, UserRole.USER]),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6)),
  })
  .refine(
    (values) => {
      if (values.password && !values.newPassword) {
        return false;
      }

      return true;
    },
    { message: "New Password is Required", path: ["newPassword"] }
  )
  .refine(
    (values) => {
      
      if (values.newPassword && !values.password) {
        return false;
      }

      return true;
    },
    { message: "Password is Required", path: ["newPassword"] }
  );;
