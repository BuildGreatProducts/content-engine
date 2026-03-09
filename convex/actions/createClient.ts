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
    const scrypt = new Scrypt();
    const hashedPassword = await scrypt.hash(password);

    await ctx.runMutation(internal.clientRecords.insertClientRecords, {
      email,
      name,
      hashedPassword,
      workspaceId,
    });
  },
});
