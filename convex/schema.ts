import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Users — both admin (Lawrence) and clients
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("client")),
    workspaceId: v.optional(v.id("workspaces")),
    createdAt: v.number(),
    lastActiveAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_workspace", ["workspaceId"]),

  // Workspaces — one per client company
  workspaces: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["isActive"]),

  // Guideline documents — up to 3 per workspace
  documents: defineTable({
    workspaceId: v.id("workspaces"),
    type: v.union(
      v.literal("tone_of_voice"),
      v.literal("content_guidelines"),
      v.literal("copywriting_framework")
    ),
    title: v.string(),
    content: v.string(),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_type", ["workspaceId", "type"]),

  // Content items — generated content stored per workspace
  content: defineTable({
    workspaceId: v.id("workspaces"),
    generatedBy: v.id("users"),
    type: v.union(
      v.literal("blog_article"),
      v.literal("email_newsletter"),
      v.literal("website_page_copy"),
      v.literal("linkedin_post"),
      v.literal("instagram_post"),
      v.literal("x_post"),
      v.literal("case_study")
    ),
    brief: v.object({
      topic: v.optional(v.string()),
      keyMessages: v.optional(v.string()),
      targetAudience: v.optional(v.string()),
      callToAction: v.optional(v.string()),
      additionalContext: v.optional(v.string()),
      wordCount: v.optional(v.string()),
      pageName: v.optional(v.string()),
      subjectLine: v.optional(v.string()),
      clientName: v.optional(v.string()),
      results: v.optional(v.string()),
    }),
    output: v.string(),
    isHighPriority: v.boolean(),
    reviewedByAdmin: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_type", ["workspaceId", "type"])
    .index("by_workspace_chronological", ["workspaceId", "createdAt"])
    .index("by_high_priority_review_status", ["isHighPriority", "reviewedByAdmin", "createdAt"]),

  // Invitations — pending client invitations
  invitations: defineTable({
    workspaceId: v.id("workspaces"),
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    acceptedAt: v.optional(v.number()),
    lastSentAt: v.optional(v.number()),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_email", ["email"])
    .index("by_workspace", ["workspaceId"]),
});
