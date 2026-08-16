import {
  leadDraftResponseSchema,
  leadSubmissionResponseSchema,
  type LeadDraft,
  type LeadDraftResponse,
  type LeadSubmissionResponse,
  type LeadSubmissionWire,
} from "@/types/lead";

import { apiRequest } from "./client";

async function throwResponseError(response: Response): Promise<never> {
  const body = await response.text();
  throw new Error(body.length > 0 ? body : `Request failed with ${response.status}`);
}

export async function requestLeadDraft(
  conversationId: string,
  draft: LeadDraft,
): Promise<LeadDraftResponse> {
  const response = await apiRequest("/api/leads/draft", {
    method: "POST",
    body: JSON.stringify({ conversationId, draft }),
  });

  if (!response.ok) {
    await throwResponseError(response);
  }

  return leadDraftResponseSchema.parse(await response.json());
}

export async function submitLead(
  submission: LeadSubmissionWire,
): Promise<LeadSubmissionResponse> {
  const response = await apiRequest("/api/leads", {
    method: "POST",
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    await throwResponseError(response);
  }

  return leadSubmissionResponseSchema.parse(await response.json());
}
