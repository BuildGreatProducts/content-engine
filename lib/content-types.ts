import {
  FileText,
  Mail,
  Globe,
  Linkedin,
  Instagram,
  Twitter,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import { z } from "zod";

export type FieldType = "input" | "textarea" | "select";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
}

export interface ContentTypeConfig {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  isHighPriority: boolean;
  isLongForm: boolean;
  fields: FieldConfig[];
}

const commonFields: FieldConfig[] = [
  {
    name: "topic",
    label: "Topic",
    type: "input",
    placeholder: "What is this content about?",
    required: true,
  },
  {
    name: "keyMessages",
    label: "Key Messages",
    type: "textarea",
    placeholder: "What are the main points you want to communicate?",
  },
  {
    name: "targetAudience",
    label: "Target Audience",
    type: "input",
    placeholder: "Who is this content for?",
  },
  {
    name: "callToAction",
    label: "Call to Action",
    type: "input",
    placeholder: "What should the reader do next?",
  },
  {
    name: "additionalContext",
    label: "Additional Context",
    type: "textarea",
    placeholder: "Any other details or requirements...",
  },
];

export const CONTENT_TYPES: ContentTypeConfig[] = [
  {
    id: "blog_article",
    name: "Blog Article",
    description: "Long-form blog posts optimised for engagement and SEO",
    icon: FileText,
    isHighPriority: false,
    isLongForm: true,
    fields: [
      ...commonFields,
      {
        name: "wordCount",
        label: "Word Count",
        type: "select",
        options: [
          { label: "Short (~500 words)", value: "500" },
          { label: "Medium (~1000 words)", value: "1000" },
          { label: "Long (~1500 words)", value: "1500" },
          { label: "In-depth (~2000 words)", value: "2000" },
        ],
      },
    ],
  },
  {
    id: "email_newsletter",
    name: "Email Newsletter",
    description: "Engaging newsletters that drive opens and clicks",
    icon: Mail,
    isHighPriority: false,
    isLongForm: false,
    fields: [
      {
        name: "subjectLine",
        label: "Subject Line",
        type: "input",
        placeholder: "Email subject line",
        required: true,
      },
      ...commonFields,
    ],
  },
  {
    id: "website_page_copy",
    name: "Website Page Copy",
    description: "Conversion-focused copy for landing pages and site sections",
    icon: Globe,
    isHighPriority: true,
    isLongForm: true,
    fields: [
      {
        name: "pageName",
        label: "Page Name",
        type: "input",
        placeholder: "e.g. Homepage, About, Services",
        required: true,
      },
      ...commonFields,
    ],
  },
  {
    id: "linkedin_post",
    name: "LinkedIn Post",
    description: "Professional posts that build authority and engagement",
    icon: Linkedin,
    isHighPriority: false,
    isLongForm: false,
    fields: commonFields,
  },
  {
    id: "instagram_post",
    name: "Instagram Post",
    description: "Captions and copy for Instagram feed and stories",
    icon: Instagram,
    isHighPriority: false,
    isLongForm: false,
    fields: commonFields,
  },
  {
    id: "x_post",
    name: "X Post",
    description: "Concise, engaging posts for X (formerly Twitter)",
    icon: Twitter,
    isHighPriority: false,
    isLongForm: false,
    fields: commonFields,
  },
  {
    id: "case_study",
    name: "Case Study",
    description: "Compelling client success stories with measurable results",
    icon: Briefcase,
    isHighPriority: true,
    isLongForm: true,
    fields: [
      {
        name: "clientName",
        label: "Client Name",
        type: "input",
        placeholder: "Client or company name",
        required: true,
      },
      {
        name: "results",
        label: "Results & Metrics",
        type: "textarea",
        placeholder: "Key results, metrics, and outcomes achieved",
        required: true,
      },
      ...commonFields,
    ],
  },
];

export function getContentType(id: string): ContentTypeConfig | undefined {
  return CONTENT_TYPES.find((t) => t.id === id);
}

export function createBriefSchema(config: ContentTypeConfig) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of config.fields) {
    let fieldSchema: z.ZodTypeAny;

    if (field.type === "select" && field.options && field.options.length > 0) {
      const values = field.options.map((o) => o.value) as [string, ...string[]];
      fieldSchema = field.required
        ? z.enum(values, { message: `${field.label} is required` })
        : z.enum(values).or(z.literal("")).optional();
    } else {
      const strSchema = field.required
        ? z.string().min(1, `${field.label} is required`)
        : z.string();
      fieldSchema = field.required ? strSchema : strSchema.optional();
    }

    shape[field.name] = fieldSchema;
  }
  return z.object(shape);
}
