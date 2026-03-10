import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { requireAdmin, requireWorkspaceAccess } from "./helpers";

const MAX_GENERATIONS_PER_DAY = 20;

const contentType = v.union(
  v.literal("blog_article"),
  v.literal("email_newsletter"),
  v.literal("website_page_copy"),
  v.literal("linkedin_post"),
  v.literal("instagram_post"),
  v.literal("x_post"),
  v.literal("case_study")
);

export const generate = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    type: contentType,
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
    isHighPriority: v.boolean(),
  },
  handler: async (ctx, { workspaceId, type, brief, isHighPriority }) => {
    const user = await requireWorkspaceAccess(ctx, workspaceId);

    // Rate limit check
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentContent = await ctx.db
      .query("content")
      .withIndex("by_workspace_chronological", (q) =>
        q.eq("workspaceId", workspaceId).gte("createdAt", oneDayAgo)
      )
      .take(MAX_GENERATIONS_PER_DAY + 1);

    if (recentContent.length >= MAX_GENERATIONS_PER_DAY) {
      throw new ConvexError(
        `Rate limit reached. Maximum ${MAX_GENERATIONS_PER_DAY} generations per day.`
      );
    }

    const contentId = await ctx.db.insert("content", {
      workspaceId,
      generatedBy: user._id,
      type,
      brief,
      output: "",
      isHighPriority,
      reviewedByAdmin: false,
      createdAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.actions.generateContent.run, {
      contentId,
    });

    return contentId;
  },
});

export const listByWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.optional(contentType),
  },
  handler: async (ctx, { workspaceId, type }) => {
    await requireWorkspaceAccess(ctx, workspaceId);

    if (type) {
      return ctx.db
        .query("content")
        .withIndex("by_workspace_and_type", (q) =>
          q.eq("workspaceId", workspaceId).eq("type", type)
        )
        .order("desc")
        .take(50);
    }

    return ctx.db
      .query("content")
      .withIndex("by_workspace_chronological", (q) =>
        q.eq("workspaceId", workspaceId)
      )
      .order("desc")
      .take(50);
  },
});

export const getById = query({
  args: { id: v.id("content") },
  handler: async (ctx, { id }) => {
    const content = await ctx.db.get(id);
    if (!content) return null;
    await requireWorkspaceAccess(ctx, content.workspaceId);
    return content;
  },
});

export const markReviewed = mutation({
  args: { id: v.id("content") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { reviewedByAdmin: true });
  },
});

export const _getById = internalQuery({
  args: { id: v.id("content") },
  handler: async (ctx, { id }) => {
    return ctx.db.get(id);
  },
});

export const _saveOutput = internalMutation({
  args: {
    id: v.id("content"),
    output: v.string(),
  },
  handler: async (ctx, { id, output }) => {
    await ctx.db.patch(id, { output });
  },
});

export const _markFailed = internalMutation({
  args: {
    id: v.id("content"),
    message: v.string(),
  },
  handler: async (ctx, { id, message }) => {
    await ctx.db.patch(id, { output: `GENERATION_FAILED: ${message}` });
  },
});
