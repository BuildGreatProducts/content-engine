import { z } from "zod";

export const workspaceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().optional(),
});

export type WorkspaceFormData = z.infer<typeof workspaceSchema>;
