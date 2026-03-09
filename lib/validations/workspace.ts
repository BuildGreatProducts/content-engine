import { z } from "zod";

export const workspaceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Slug must start/end with a letter or number, with single hyphens between segments"
  ),
  description: z.string().optional(),
});

export type WorkspaceFormData = z.infer<typeof workspaceSchema>;
