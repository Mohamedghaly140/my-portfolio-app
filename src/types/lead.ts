import { z } from "zod";

import { leadFormBlockSchema, type LeadFormBlock } from "@/features/chat/blocks";

export const OPPORTUNITY_TYPES = [
  "FREELANCE_PROJECT",
  "FULL_TIME_ROLE",
  "CONTRACT_ROLE",
  "CONSULTING",
  "COLLABORATION",
  "NETWORKING",
  "OTHER",
] as const;

export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  FREELANCE_PROJECT: "Freelance project",
  FULL_TIME_ROLE: "Full-time role",
  CONTRACT_ROLE: "Contract role",
  CONSULTING: "Consulting",
  COLLABORATION: "Collaboration",
  NETWORKING: "Networking",
  OTHER: "Other",
};

export type LeadDraft = LeadFormBlock["draft"];

export const leadFormValuesSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120),
  email: z
    .string()
    .trim()
    .max(254)
    .pipe(z.email("Please enter a valid email address")),
  company: z.string().max(160),
  opportunityType: z.enum(OPPORTUNITY_TYPES, {
    error: "Select an opportunity type",
  }),
  summary: z.string().trim().min(1, "Summary is required").max(1000),
  technologies: z.string().max(2000),
  timeline: z.string().max(240),
  projectStage: z.string().max(160),
  primaryTechnicalProblem: z.string().max(1000),
  budgetContext: z.string().max(240),
  preferredContact: z.string().max(160),
  consent: z.literal(true, { error: "Consent is required to submit" }),
});

export type LeadFormValues = z.infer<typeof leadFormValuesSchema>;

const leadDraftSchema = leadFormBlockSchema.shape.draft;

export const leadSubmissionWireSchema = z.strictObject({
  conversationId: z.string(),
  leadDraftToken: z.string(),
  idempotencyKey: z.string(),
  name: z.string(),
  email: z.string(),
  company: z.string().nullable().optional(),
  opportunityType: z.enum(OPPORTUNITY_TYPES),
  summary: z.string(),
  technologies: z.array(z.string()),
  projectStage: z.string().nullable().optional(),
  primaryTechnicalProblem: z.string().nullable().optional(),
  timeline: z.string().nullable().optional(),
  budgetContext: z.string().nullable().optional(),
  preferredContact: z.string().nullable().optional(),
  consent: z.literal(true),
  privacyNoticeVersion: z.string(),
});

export type LeadSubmissionWire = z.infer<typeof leadSubmissionWireSchema>;

export const leadDraftResponseSchema = z.strictObject({
  draft: leadDraftSchema,
  leadDraftToken: z.string(),
  idempotencyKey: z.string(),
  expiresAt: z.string(),
  privacyNoticeVersion: z.string(),
});

export type LeadDraftResponse = z.infer<typeof leadDraftResponseSchema>;

export const leadSubmissionResponseSchema = z.strictObject({
  lead: z.strictObject({
    reference: z.string(),
    status: z.literal("RECEIVED"),
  }),
  requestId: z.string(),
});

export type LeadSubmissionResponse = z.infer<typeof leadSubmissionResponseSchema>;

const TECHNOLOGY_ITEM_MAX = 80;
const TECHNOLOGY_ITEMS_MAX = 20;

/** Split a comma-separated technologies field into wire-ready items. */
export function splitTechnologies(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((item) =>
      item.length > TECHNOLOGY_ITEM_MAX
        ? item.slice(0, TECHNOLOGY_ITEM_MAX)
        : item,
    )
    .slice(0, TECHNOLOGY_ITEMS_MAX);
}

function isOpportunityType(value: string): value is OpportunityType {
  return (OPPORTUNITY_TYPES as readonly string[]).includes(value);
}

function emptyToNull(value: string): string | null {
  return value.trim().length === 0 ? null : value;
}

/**
 * Maps a streamed lead draft into react-hook-form default values.
 *
 * When `draft.opportunityType` is null/invalid, `opportunityType` is set to
 * `""` (cast) so the select starts unselected — the schema still requires a
 * real enum value on submit. `consent` starts as `false` (cast) for the same
 * reason: the wire/schema require literal `true`.
 */
export function initialLeadFormValues(draft: LeadDraft): LeadFormValues {
  const rawOpportunity = draft.opportunityType;
  const opportunityType: OpportunityType =
    rawOpportunity != null && isOpportunityType(rawOpportunity)
      ? rawOpportunity
      : ("" as OpportunityType);

  return {
    name: "",
    email: "",
    company: "",
    opportunityType,
    summary: draft.summary ?? "",
    technologies: draft.technologies.join(", "),
    timeline: draft.timeline ?? "",
    projectStage: draft.projectStage ?? "",
    primaryTechnicalProblem: draft.primaryTechnicalProblem ?? "",
    budgetContext: "",
    preferredContact: "",
    consent: false as unknown as true,
  };
}

export function buildLeadSubmissionWire(args: {
  conversationId: string;
  credentials: LeadDraftResponse;
  values: LeadFormValues;
}): LeadSubmissionWire {
  const { conversationId, credentials, values } = args;

  return leadSubmissionWireSchema.parse({
    conversationId,
    leadDraftToken: credentials.leadDraftToken,
    idempotencyKey: credentials.idempotencyKey,
    name: values.name,
    email: values.email,
    company: emptyToNull(values.company),
    opportunityType: values.opportunityType,
    summary: values.summary,
    technologies: splitTechnologies(values.technologies),
    projectStage: emptyToNull(values.projectStage),
    primaryTechnicalProblem: emptyToNull(values.primaryTechnicalProblem),
    timeline: emptyToNull(values.timeline),
    budgetContext: emptyToNull(values.budgetContext),
    preferredContact: emptyToNull(values.preferredContact),
    consent: values.consent,
    privacyNoticeVersion: credentials.privacyNoticeVersion,
  });
}
