import { beforeEach, describe, expect, mock, test } from "bun:test";

const requestLeadDraft = mock(async () => draftResponse);
const submitLead = mock(async () => submissionResponse);

mock.module("@/lib/api/leads", () => ({
  requestLeadDraft,
  submitLead,
}));

const draft = {
  opportunityType: "FREELANCE_PROJECT" as const,
  summary: "Need a Flutter rebuild",
  technologies: ["Flutter"],
  timeline: null,
  projectStage: null,
  primaryTechnicalProblem: null,
};

const draftResponse = {
  draft,
  leadDraftToken: "token",
  idempotencyKey: "11111111-1111-1111-1111-111111111111",
  expiresAt: "2026-08-16T00:00:00.000Z",
  privacyNoticeVersion: "2026-01",
};

const submissionResponse = {
  lead: { reference: "LEAD-ABC", status: "RECEIVED" as const },
  requestId: "req_1",
};

const values = {
  name: "Jane Doe",
  email: "jane@example.com",
  company: "",
  opportunityType: "FREELANCE_PROJECT" as const,
  summary: "Need a Flutter rebuild",
  technologies: "Flutter",
  timeline: "",
  projectStage: "",
  primaryTechnicalProblem: "",
  budgetContext: "",
  preferredContact: "",
  consent: true as const,
};

const conversationId = "22222222-2222-2222-2222-222222222222";

describe("submitLeadFormAttempt", () => {
  beforeEach(() => {
    requestLeadDraft.mockReset();
    submitLead.mockReset();
    requestLeadDraft.mockImplementation(async () => draftResponse);
    submitLead.mockImplementation(async () => submissionResponse);
  });

  test("fetches a draft when credentials are missing, then submits", async () => {
    const { submitLeadFormAttempt } = await import("./leadFormAttempt");

    const result = await submitLeadFormAttempt({
      conversationId,
      draft,
      values,
      cachedCredentials: null,
    });

    expect(requestLeadDraft).toHaveBeenCalledTimes(1);
    expect(requestLeadDraft).toHaveBeenCalledWith(conversationId, draft);
    expect(submitLead).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      status: "success",
      response: submissionResponse,
      credentials: draftResponse,
    });
  });

  test("submits directly when credentials are cached", async () => {
    const { submitLeadFormAttempt } = await import("./leadFormAttempt");

    const result = await submitLeadFormAttempt({
      conversationId,
      draft,
      values,
      cachedCredentials: draftResponse,
    });

    expect(requestLeadDraft).toHaveBeenCalledTimes(0);
    expect(submitLead).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      status: "success",
      response: submissionResponse,
      credentials: draftResponse,
    });
  });

  test("clears credentials when submit throws LEAD_DRAFT_EXPIRED", async () => {
    submitLead.mockImplementation(async () => {
      throw new Error(
        JSON.stringify({
          error: {
            code: "LEAD_DRAFT_EXPIRED",
            message: "ignored",
            retryable: false,
          },
        }),
      );
    });

    const { submitLeadFormAttempt } = await import("./leadFormAttempt");

    const result = await submitLeadFormAttempt({
      conversationId,
      draft,
      values,
      cachedCredentials: draftResponse,
    });

    expect(result.status).toBe("error");
    if (result.status !== "error") return;
    expect(result.code).toBe("LEAD_DRAFT_EXPIRED");
    expect(result.message).toBe(
      "This contact form has expired. Review it and try again.",
    );
    expect(result.credentials).toBeNull();
  });

  test("keeps credentials when submit throws another error code", async () => {
    submitLead.mockImplementation(async () => {
      throw new Error(
        JSON.stringify({
          error: {
            code: "RATE_LIMITED",
            message: "ignored",
            retryable: true,
          },
        }),
      );
    });

    const { submitLeadFormAttempt } = await import("./leadFormAttempt");

    const result = await submitLeadFormAttempt({
      conversationId,
      draft,
      values,
      cachedCredentials: draftResponse,
    });

    expect(result.status).toBe("error");
    if (result.status !== "error") return;
    expect(result.code).toBe("RATE_LIMITED");
    expect(result.message).toBe(
      "You've sent several messages quickly. Try again shortly.",
    );
    expect(result.credentials).toEqual(draftResponse);
  });
});
