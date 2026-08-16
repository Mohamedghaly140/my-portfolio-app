import { parseChatError } from "@/lib/api/errors";
import { requestLeadDraft, submitLead } from "@/lib/api/leads";
import {
  buildLeadSubmissionWire,
  type LeadDraft,
  type LeadDraftResponse,
  type LeadFormValues,
  type LeadSubmissionResponse,
} from "@/types/lead";

export type LeadFormAttemptResult =
  | {
      status: "success";
      response: LeadSubmissionResponse;
      credentials: LeadDraftResponse;
    }
  | {
      status: "error";
      code: string;
      message: string;
      retryable: boolean;
      credentials: LeadDraftResponse | null;
    };

export async function submitLeadFormAttempt(args: {
  conversationId: string;
  draft: LeadDraft;
  values: LeadFormValues;
  cachedCredentials: LeadDraftResponse | null;
}): Promise<LeadFormAttemptResult> {
  const { conversationId, draft, values, cachedCredentials } = args;
  let credentials = cachedCredentials;

  try {
    if (!credentials) {
      credentials = await requestLeadDraft(conversationId, draft);
    }

    const wire = buildLeadSubmissionWire({
      conversationId,
      credentials,
      values,
    });
    const response = await submitLead(wire);

    return { status: "success", response, credentials };
  } catch (cause) {
    const parsed = parseChatError(cause);
    return {
      status: "error",
      code: parsed.code,
      message: parsed.message,
      retryable: parsed.retryable,
      credentials:
        parsed.code === "LEAD_DRAFT_EXPIRED" ? null : credentials,
    };
  }
}
