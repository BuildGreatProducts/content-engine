"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";

export const send = internalAction({
  args: {
    email: v.string(),
    token: v.string(),
    workspaceName: v.string(),
    expiresAt: v.number(),
  },
  handler: async (_ctx, { email, token, workspaceName, expiresAt }) => {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const siteUrl = process.env.SITE_URL || "http://localhost:3000";
    const inviteUrl = `${siteUrl}/accept-invite?token=${token}`;
    const expiryDate = new Date(expiresAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    await resend.emails.send({
      from: "Content Engine <onboarding@resend.dev>",
      to: email,
      subject: `You've been invited to ${workspaceName} on Content Engine`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>You're invited!</h2>
          <p>You've been invited to join <strong>${workspaceName}</strong> on Content Engine.</p>
          <p>
            <a href="${inviteUrl}" style="display: inline-block; background: #6B5EFF; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
              Accept Invitation
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">This invitation expires on ${expiryDate}.</p>
        </div>
      `,
    });
  },
});
