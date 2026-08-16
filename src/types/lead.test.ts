import { describe, expect, test } from "bun:test";

import {
  buildLeadSubmissionWire,
  leadFormValuesSchema,
  splitTechnologies,
  type LeadDraftResponse,
  type LeadFormValues,
} from "./lead";

const validValues: LeadFormValues = {
  name: "Jane Doe",
  email: "jane@example.com",
  company: "Acme",
  opportunityType: "FREELANCE_PROJECT",
  summary: "Need a Flutter rebuild",
  technologies: "Flutter, React Native",
  timeline: "Q3",
  projectStage: "MVP",
  primaryTechnicalProblem: "Performance",
  budgetContext: "Flexible",
  preferredContact: "Email",
  consent: true,
};

describe("leadFormValuesSchema", () => {
  test("accepts a full valid payload", () => {
    const result = leadFormValuesSchema.safeParse(validValues);
    expect(result.success).toBe(true);
  });

  test("rejects missing consent", () => {
    const result = leadFormValuesSchema.safeParse({
      ...validValues,
      consent: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("consent"))).toBe(
        true,
      );
    }
  });

  test("rejects an invalid email", () => {
    const result = leadFormValuesSchema.safeParse({
      ...validValues,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) =>
            i.path.includes("email") &&
            i.message === "Please enter a valid email address",
        ),
      ).toBe(true);
    }
  });
});

describe("splitTechnologies", () => {
  test("splits on commas and trims whitespace", () => {
    expect(splitTechnologies(" Flutter , React , ")).toEqual([
      "Flutter",
      "React",
    ]);
  });

  test("returns an empty array for an empty string", () => {
    expect(splitTechnologies("")).toEqual([]);
    expect(splitTechnologies("   ,  , ")).toEqual([]);
  });

  test("caps at 20 items and truncates each item to 80 chars", () => {
    const long = "x".repeat(100);
    const items = Array.from({ length: 25 }, (_, i) => `tech${i}`);
    items[0] = long;
    const result = splitTechnologies(items.join(","));
    expect(result).toHaveLength(20);
    expect(result[0]).toHaveLength(80);
  });
});

describe("buildLeadSubmissionWire", () => {
  const credentials: LeadDraftResponse = {
    draft: {
      opportunityType: "FREELANCE_PROJECT",
      summary: "Need a Flutter rebuild",
      technologies: ["Flutter"],
      timeline: null,
      projectStage: null,
      primaryTechnicalProblem: null,
    },
    leadDraftToken: "token",
    idempotencyKey: "11111111-1111-1111-1111-111111111111",
    expiresAt: "2026-08-16T00:00:00.000Z",
    privacyNoticeVersion: "2026-01",
  };

  test("turns empty optional strings into null", () => {
    const wire = buildLeadSubmissionWire({
      conversationId: "22222222-2222-2222-2222-222222222222",
      credentials,
      values: {
        ...validValues,
        company: "",
        timeline: "  ",
        projectStage: "",
        primaryTechnicalProblem: "",
        budgetContext: "",
        preferredContact: "",
        technologies: "",
      },
    });

    expect(wire.company).toBeNull();
    expect(wire.timeline).toBeNull();
    expect(wire.projectStage).toBeNull();
    expect(wire.primaryTechnicalProblem).toBeNull();
    expect(wire.budgetContext).toBeNull();
    expect(wire.preferredContact).toBeNull();
    expect(wire.technologies).toEqual([]);
    expect(wire.leadDraftToken).toBe("token");
    expect(wire.idempotencyKey).toBe(credentials.idempotencyKey);
    expect(wire.privacyNoticeVersion).toBe("2026-01");
  });
});
