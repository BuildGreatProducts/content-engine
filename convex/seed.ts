import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

export const hasAdmin = query({
  args: {},
  handler: async (ctx) => {
    const admin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .first();
    return !!admin;
  },
});

export const promoteToAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    // Check no admin exists yet
    const existingAdmin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .first();
    if (existingAdmin) {
      throw new ConvexError("Admin account already exists.");
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    await ctx.db.patch(userId, { role: "admin" });
    return { success: true };
  },
});

export const seedAdmin = internalMutation({
  args: {
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, { email, name }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { role: "admin" });
      return { userId: existing._id, action: "updated" };
    }

    return { action: "not_found", message: "Sign up first, then run this to promote to admin." };
  },
});
