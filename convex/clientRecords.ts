import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const insertClientRecords = internalMutation({
  args: {
    email: v.string(),
    name: v.string(),
    hashedPassword: v.string(),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, { email, name, hashedPassword, workspaceId }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();
    if (existing) {
      throw new Error("A user with this email already exists.");
    }

    const userId = await ctx.db.insert("users", {
      name,
      email: normalizedEmail,
      role: "client",
      workspaceId,
      createdAt: Date.now(),
    });

    await ctx.db.insert("authAccounts", {
      userId,
      provider: "password",
      providerAccountId: normalizedEmail,
      secret: hashedPassword,
    });

    return userId;
  },
});
