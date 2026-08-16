import { describe, expect, mock, test } from "bun:test";

mock.module("expo/fetch", () => ({
  fetch: mock(async () => new Response("{}", { status: 200 })),
}));

mock.module("expo-secure-store", () => {
  let stored: string | null = "v1.stored-session.sig";
  return {
    getItemAsync: mock(async () => stored),
    setItemAsync: mock(async (_key: string, value: string) => {
      stored = value;
    }),
    deleteItemAsync: mock(async () => {
      stored = null;
    }),
  };
});

const draft = {
  opportunityType: "FREELANCE_PROJECT",
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

const submission = {
  conversationId: "22222222-2222-2222-2222-222222222222",
  leadDraftToken: "token",
  idempotencyKey: "11111111-1111-1111-1111-111111111111",
  name: "Jane Doe",
  email: "jane@example.com",
  company: null,
  opportunityType: "FREELANCE_PROJECT" as const,
  summary: "Need a Flutter rebuild",
  technologies: ["Flutter"],
  projectStage: null,
  primaryTechnicalProblem: null,
  timeline: null,
  budgetContext: null,
  preferredContact: null,
  consent: true as const,
  privacyNoticeVersion: "2026-01",
};

describe("leads API", () => {
  test("requestLeadDraft resolves a 200 JSON body", async () => {
    mock.module("expo/fetch", () => ({
      fetch: mock(
        async () =>
          new Response(JSON.stringify(draftResponse), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
      ),
    }));

    const { requestLeadDraft } = await import("./leads");
    const result = await requestLeadDraft(
      "22222222-2222-2222-2222-222222222222",
      draft,
    );
    expect(result.leadDraftToken).toBe("token");
    expect(result.privacyNoticeVersion).toBe("2026-01");
  });

  test("submitLead resolves a 201 JSON body", async () => {
    mock.module("expo/fetch", () => ({
      fetch: mock(
        async () =>
          new Response(
            JSON.stringify({
              lead: { reference: "LD-1", status: "RECEIVED" },
              requestId: "req_1",
            }),
            {
              status: 201,
              headers: { "content-type": "application/json" },
            },
          ),
      ),
    }));

    const { submitLead } = await import("./leads");
    const result = await submitLead(submission);
    expect(result.lead.reference).toBe("LD-1");
    expect(result.lead.status).toBe("RECEIVED");
  });

  test("non-ok LEAD_DRAFT_EXPIRED body round-trips through parseChatError", async () => {
    const errorBody = JSON.stringify({
      error: {
        code: "LEAD_DRAFT_EXPIRED",
        message: "server text ignored",
        retryable: false,
      },
      requestId: "req_expired",
    });

    mock.module("expo/fetch", () => ({
      fetch: mock(
        async () =>
          new Response(errorBody, {
            status: 400,
            headers: { "content-type": "application/json" },
          }),
      ),
    }));

    const { requestLeadDraft } = await import("./leads");
    const { parseChatError } = await import("./errors");

    try {
      await requestLeadDraft("22222222-2222-2222-2222-222222222222", draft);
      throw new Error("expected requestLeadDraft to throw");
    } catch (error) {
      const parsed = parseChatError(error);
      expect(parsed.code).toBe("LEAD_DRAFT_EXPIRED");
      expect(parsed.retryable).toBe(false);
    }
  });
});
