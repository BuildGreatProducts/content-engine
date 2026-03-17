"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const send = internalAction({
  args: {
    contentId: v.id("content"),
    workspaceName: v.string(),
    contentType: v.string(),
  },
  handler: async (_ctx, { contentId, workspaceName, contentType }) => {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error("ADMIN_EMAIL not set — skipping review notification");
      return;
    }

    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const siteUrl = process.env.SITE_URL || "http://localhost:3000";
      const reviewUrl = `${siteUrl}/admin/reviews`;
      const safeWorkspaceName = escapeHtml(workspaceName);
      const readableType = contentType.replace(/_/g, " ");

      const { error } = await resend.emails.send({
        from: "Content Engine <onboarding@resend.dev>",
        to: adminEmail,
        subject: `New high-priority content awaiting review — ${workspaceName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>New content awaiting review</h2>
            <p>A <strong>${escapeHtml(readableType)}</strong> has been generated for <strong>${safeWorkspaceName}</strong> and needs your review.</p>
            <p>
              <a href="${reviewUrl}" style="display: inline-block; background: #6B5EFF; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
                Review Now
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">Content ID: ${contentId}</p>
          </div>
        `,
      });

      if (error) {
        console.error("Failed to send admin review notification:", error.message);
      }
    } catch (error) {
      console.error(
        "Failed to send admin review notification:",
        error instanceof Error ? error.message : error
      );
    }
  },
});
