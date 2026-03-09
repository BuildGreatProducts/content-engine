import { query, mutation, internalMutation, internalQuery, action } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireAdmin, requireAdminQuery } from "./helpers";
import { internal } from "./_generated/api";

export const _create = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    email: v.string(),
    tokenHash: v.string(),
    expiresAt: v.number(),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("invitations", {
      workspaceId: args.workspaceId,
      email: args.email,
      token: args.tokenHash,
      expiresAt: args.expiresAt,
      createdBy: args.createdBy,
      createdAt: Date.now(),
    });
  },
});

export const send = action({
  args: {
    workspaceId: v.id("workspaces"),
    email: v.string(),
  },
  handler: async (ctx, { workspaceId, email }) => {
    // Verify admin
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const user = await ctx.runQuery(internal.invitations._getUser, { userId });
    if (!user || user.role !== "admin") {
      throw new ConvexError("Forbidden: admin access required");
    }

    const workspace = await ctx.runQuery(internal.invitations._getWorkspace, { workspaceId });
    if (!workspace) throw new ConvexError("Workspace not found");

    // Generate token
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const token = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    await ctx.runMutation(internal.invitations._create, {
      workspaceId,
      email,
      tokenHash: token,
      expiresAt,
      createdBy: userId,
    });

    // Send email
    await ctx.runAction(internal.actions.sendInvitation.send, {
      email,
      token,
      workspaceName: workspace.name,
      expiresAt,
    });

    return { success: true };
  },
});

// Internal queries needed by the send action
export const _getUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db.get(userId);
  },
});

export const _getWorkspace = internalQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    return ctx.db.get(workspaceId);
  },
});

export const validate = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (!invitation) return { valid: false as const };
    if (invitation.acceptedAt) return { valid: false as const, reason: "already_accepted" };
    if (invitation.expiresAt < Date.now()) return { valid: false as const, reason: "expired" };

    const workspace = await ctx.db.get(invitation.workspaceId);

    return {
      valid: true as const,
      email: invitation.email,
      workspaceName: workspace?.name ?? "Unknown",
      workspaceId: invitation.workspaceId,
    };
  },
});

export const accept = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (!invitation) throw new ConvexError("Invalid invitation");
    if (invitation.acceptedAt) throw new ConvexError("Invitation already accepted");
    if (invitation.expiresAt < Date.now()) throw new ConvexError("Invitation expired");

    // Update user with workspace and role
    await ctx.db.patch(userId, {
      workspaceId: invitation.workspaceId,
      role: "client",
    });

    // Mark invitation as accepted
    await ctx.db.patch(invitation._id, {
      acceptedAt: Date.now(),
    });
  },
});

export const createClient = action({
  args: {
    workspaceId: v.id("workspaces"),
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, { workspaceId, email, password, name }) => {
    // Verify admin
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const user = await ctx.runQuery(internal.invitations._getUser, { userId });
    if (!user || user.role !== "admin") {
      throw new ConvexError("Forbidden: admin access required");
    }

    // Create client account directly
    await ctx.runAction(internal.actions.createClient.create, {
      email,
      password,
      name,
      workspaceId,
    });

    return { success: true };
  },
});

export const listByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const admin = await requireAdminQuery(ctx);
    if (!admin) return null;
    return ctx.db
      .query("invitations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .order("desc")
      .collect();
  },
});
