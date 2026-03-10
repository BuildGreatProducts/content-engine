import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireWorkspaceAccess } from "./helpers";

const documentType = v.union(
  v.literal("tone_of_voice"),
  v.literal("content_guidelines"),
  v.literal("copywriting_framework")
);

export const listByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    await requireAdmin(ctx);
    return ctx.db
      .query("documents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const getByType = query({
  args: {
    workspaceId: v.id("workspaces"),
    type: documentType,
  },
  handler: async (ctx, { workspaceId, type }) => {
    await requireWorkspaceAccess(ctx, workspaceId);
    return ctx.db
      .query("documents")
      .withIndex("by_workspace_and_type", (q) =>
        q.eq("workspaceId", workspaceId).eq("type", type)
      )
      .first();
  },
});

export const upsert = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    type: documentType,
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, { workspaceId, type, title, content }) => {
    const admin = await requireAdmin(ctx);
    const existing = await ctx.db
      .query("documents")
      .withIndex("by_workspace_and_type", (q) =>
        q.eq("workspaceId", workspaceId).eq("type", type)
      )
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        title,
        content,
        updatedAt: now,
        updatedBy: admin._id,
      });
      return existing._id;
    }

    return ctx.db.insert("documents", {
      workspaceId,
      type,
      title,
      content,
      updatedAt: now,
      updatedBy: admin._id,
    });
  },
});

export const _getByType = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    type: documentType,
  },
  handler: async (ctx, { workspaceId, type }) => {
    return ctx.db
      .query("documents")
      .withIndex("by_workspace_and_type", (q) =>
        q.eq("workspaceId", workspaceId).eq("type", type)
      )
      .first();
  },
});
