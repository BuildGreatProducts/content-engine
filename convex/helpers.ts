import { QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user || user.role !== "admin")
    throw new ConvexError("Forbidden: admin access required");
  return user;
}

export async function requireWorkspaceAccess(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">
) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user) throw new ConvexError("User not found");
  if (user.role === "admin") return user;
  if (user.workspaceId?.toString() !== workspaceId.toString())
    throw new ConvexError("Forbidden: workspace access denied");
  return user;
}
