"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

const LONG_FORM_TYPES = new Set([
  "blog_article",
  "website_page_copy",
  "case_study",
]);

export const run = internalAction({
  args: { contentId: v.id("content") },
  handler: async (ctx, { contentId }) => {
    // Fetch the content record
    const content = await ctx.runQuery(internal.content._getById, {
      id: contentId,
    });
    if (!content) {
      return;
    }

    try {
      // Fetch workspace + 3 guideline docs in parallel
      const [workspace, toneDoc, guidelinesDoc, frameworkDoc] =
        await Promise.all([
          ctx.runQuery(internal.workspaces._getById, {
            id: content.workspaceId,
          }),
          ctx.runQuery(internal.documents._getByType, {
            workspaceId: content.workspaceId,
            type: "tone_of_voice",
          }),
          ctx.runQuery(internal.documents._getByType, {
            workspaceId: content.workspaceId,
            type: "content_guidelines",
          }),
          ctx.runQuery(internal.documents._getByType, {
            workspaceId: content.workspaceId,
            type: "copywriting_framework",
          }),
        ]);

      if (!workspace) {
        throw new Error(`Workspace ${content.workspaceId} not found`);
      }

      const workspaceName = workspace.name;

      // Build system prompt
      const docSection = (
        label: string,
        doc: { content: string } | null
      ) => {
        if (doc?.content) {
          return `\n## ${label}\n${doc.content}`;
        }
        return `\n## ${label}\nNo ${label.toLowerCase()} provided. Use professional best practices.`;
      };

      const systemPrompt = `You are a professional content writer for "${workspaceName}". Generate high-quality, on-brand content based on the brief provided.

Follow these workspace guidelines:
${docSection("Tone of Voice", toneDoc)}
${docSection("Content Guidelines", guidelinesDoc)}
${docSection("Copywriting Framework", frameworkDoc)}

Output the content in markdown format. Do not include any preamble or meta-commentary — just the content itself.`;

      // Build user prompt from brief
      const briefLines: string[] = [`Content type: ${content.type.replace(/_/g, " ")}`];
      const brief = content.brief;
      if (brief.topic) briefLines.push(`Topic: ${brief.topic}`);
      if (brief.keyMessages) briefLines.push(`Key messages: ${brief.keyMessages}`);
      if (brief.targetAudience) briefLines.push(`Target audience: ${brief.targetAudience}`);
      if (brief.callToAction) briefLines.push(`Call to action: ${brief.callToAction}`);
      if (brief.additionalContext) briefLines.push(`Additional context: ${brief.additionalContext}`);
      if (brief.wordCount) briefLines.push(`Target word count: ~${brief.wordCount} words`);
      if (brief.pageName) briefLines.push(`Page name: ${brief.pageName}`);
      if (brief.subjectLine) briefLines.push(`Subject line: ${brief.subjectLine}`);
      if (brief.clientName) briefLines.push(`Client name: ${brief.clientName}`);
      if (brief.results) briefLines.push(`Results & metrics: ${brief.results}`);

      const isLongForm = LONG_FORM_TYPES.has(content.type);
      const model = isLongForm
        ? "claude-opus-4-5-20250514"
        : "claude-haiku-4-5-20241022";
      const maxTokens = isLongForm ? 4096 : 1024;

      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic();

      let response;
      const MAX_RETRIES = 3;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          response = await client.messages.create({
            model,
            max_tokens: maxTokens,
            system: systemPrompt,
            messages: [{ role: "user", content: briefLines.join("\n") }],
          });
          break;
        } catch (apiError: any) {
          const isRateLimit =
            apiError?.status === 429 ||
            apiError?.error?.type === "rate_limit_error";
          const isTimeout =
            apiError?.error?.type === "timeout_error" ||
            apiError?.code === "ETIMEDOUT";

          if ((isRateLimit || isTimeout) && attempt < MAX_RETRIES) {
            const backoff = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            await new Promise((r) => setTimeout(r, backoff));
            continue;
          }

          if (isTimeout) {
            throw new Error(
              "Content generation is taking longer than expected. Please try again."
            );
          }

          if (isRateLimit) {
            throw new Error("Content generation failed after multiple attempts. Please try again.");
          }

          // Don't expose raw API error details to the client
          throw new Error("Content generation failed. Please try again.");
        }
      }

      if (!response) {
        throw new Error("Content generation failed after multiple attempts. Please try again.");
      }

      const output = response.content
        .filter((block): block is Extract<typeof block, { type: "text" }> => block.type === "text")
        .map((block) => block.text)
        .join("\n");

      await ctx.runMutation(internal.content._saveOutput, {
        id: contentId,
        output,
      });

      // Notify admin if high-priority content was generated
      if (content.isHighPriority) {
        try {
          await ctx.scheduler.runAfter(
            0,
            internal.actions.notifyAdminReview.send,
            {
              contentId,
              workspaceName,
              contentType: content.type,
            }
          );
        } catch (err) {
          console.error(
            `Failed to schedule admin notification for ${contentId}:`,
            err instanceof Error ? err.message : err
          );
        }
      }
    } catch (error) {
      const rawMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error(`Content generation failed for ${contentId}:`, rawMessage);
      // Only pass through known safe messages; sanitize anything else
      const safeMessages = [
        "Content generation is taking longer than expected. Please try again.",
        "Content generation failed. Please try again.",
        "Content generation failed after multiple attempts. Please try again.",
      ];
      const message = safeMessages.includes(rawMessage)
        ? rawMessage
        : "Content generation failed. Please try again.";
      await ctx.runMutation(internal.content._markFailed, {
        id: contentId,
        message,
      });
    }
  },
});
