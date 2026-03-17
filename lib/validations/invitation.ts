import { z } from "zod";

export const acceptInviteSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type AcceptInviteFormData = z.infer<typeof acceptInviteSchema>;

export const createClientSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type CreateClientFormData = z.infer<typeof createClientSchema>;

export const inviteEmailSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Invalid email address"),
});

export type InviteEmailFormData = z.infer<typeof inviteEmailSchema>;
