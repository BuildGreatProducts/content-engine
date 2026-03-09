import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireAdmin, requireAdminQuery } from "./helpers";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const admin = await requireAdminQuery(ctx);
    if (!admin) return null;
    const workspaces = await ctx.db
      .query("workspaces")
      .order("desc")
      .collect();
    return workspaces;
  },
});

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user || !user.workspaceId) return null;
    return ctx.db.get(user.workspaceId);
  },
});

export const getById = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, { id }) => {
    const admin = await requireAdminQuery(ctx);
    if (!admin) return null;
    return ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { name, slug, description }) => {
    await requireAdmin(ctx);
    const finalSlug = slug || slugify(name);

    const existing = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", finalSlug))
      .first();
    if (existing) {
      throw new ConvexError("A workspace with this slug already exists.");
    }

    const now = Date.now();
    return ctx.db.insert("workspaces", {
      name,
      slug: finalSlug,
      description,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("workspaces"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { ...fields, updatedAt: Date.now() });
  },
});

export const listWithStats = query({
  args: {},
  handler: async (ctx) => {
    const admin = await requireAdminQuery(ctx);
    if (!admin) return null;
    const workspaces = await ctx.db
      .query("workspaces")
      .order("desc")
      .collect();

    return Promise.all(
      workspaces.map(async (ws) => {
        const contentItems = await ctx.db
          .query("content")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", ws._id))
          .collect();

        const documents = await ctx.db
          .query("documents")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", ws._id))
          .collect();

        // Find client user for this workspace
        const clientUser = await ctx.db
          .query("users")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", ws._id))
          .first();

        const docTypes = ["tone_of_voice", "content_guidelines", "copywriting_framework"] as const;
        const documentStatus = docTypes.map((type) => ({
          type,
          uploaded: documents.some((d) => d.type === type),
        }));

        return {
          ...ws,
          contentCount: contentItems.length,
          pendingReviews: contentItems.filter((c) => !c.reviewedByAdmin).length,
          clientEmail: clientUser?.email ?? null,
          lastActivity: contentItems.length > 0
            ? Math.max(...contentItems.map((c) => c.createdAt))
            : ws.updatedAt,
          documentStatus,
        };
      })
    );
  },
});
