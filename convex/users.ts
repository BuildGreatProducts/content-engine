import { query } from "./_generated/server";
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
  args: {},
  handler: async (ctx) => {
    const admin = await requireAdminQuery(ctx);
    if (!admin) return null;
    const users = await ctx.db.query("users").collect();
    const clients = users.filter((u) => u.role === "client");

    return Promise.all(
      clients.map(async (client) => {
        const workspace = client.workspaceId
          ? await ctx.db.get(client.workspaceId)
          : null;
        return {
          _id: client._id,
          name: client.name,
          email: client.email,
          workspaceName: workspace?.name ?? null,
          lastActiveAt: client.lastActiveAt,
        };
      })
    );
  },
});
