"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Scrypt } from "lucia";

export const create = internalAction({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, { email, password, name, workspaceId }) => {
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    const scrypt = new Scrypt();
    const hashedPassword = await scrypt.hash(password);

    const normalizedEmail = email.trim().toLowerCase();

    await ctx.runMutation(internal.clientRecords.insertClientRecords, {
      email: normalizedEmail,
      name: name.trim(),
      hashedPassword,
      workspaceId,
    });
  },
});
