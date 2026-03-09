import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireAdminQuery } from "./helpers";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      workspaceId: user.workspaceId,
    };
  },
});

export const listClients = query({
  args: { workspaceId: v.optional(v.id("workspaces")) },
  handler: async (ctx, { workspaceId }) => {
    const admin = await requireAdminQuery(ctx);
    if (!admin) return null;

    let clients;
    if (workspaceId) {
      clients = await ctx.db
        .query("users")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
        .collect();
      clients = clients.filter((u) => u.role === "client");
    } else {
      const users = await ctx.db.query("users").collect();
      clients = users.filter((u) => u.role === "client");
    }

    // Batch-fetch unique workspaces
    const workspaceIds = [...new Set(clients.map((c) => c.workspaceId).filter(Boolean))];
    const workspaces = await Promise.all(workspaceIds.map((id) => ctx.db.get(id!)));
    const workspaceMap = new Map(
      workspaceIds.map((id, i) => [id!.toString(), workspaces[i]])
    );

    return clients.map((client) => ({
      _id: client._id,
      name: client.name,
      email: client.email,
      workspaceName: client.workspaceId
        ? workspaceMap.get(client.workspaceId.toString())?.name ?? null
        : null,
      lastActiveAt: client.lastActiveAt,
    }));
  },
});
