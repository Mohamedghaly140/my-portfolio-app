import type { ContactFormValues } from "@/features/contact/types";

import { apiRequest } from "./client";

const CONTACT_FAILURE_MESSAGE = "Failed to send email. Please try again.";
const CONTACT_NETWORK_MESSAGE = "Check your connection and try again.";

export type ContactSubmitResult =
  | { ok: true }
  | {
      ok: false;
      code: "VALIDATION" | "SERVER" | "NETWORK";
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

type ContactResponseBody = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function submitContact(
  values: ContactFormValues,
): Promise<ContactSubmitResult> {
  try {
    const response = await apiRequest("/api/contact", {
      method: "POST",
      body: JSON.stringify(values),
    });

    let body: ContactResponseBody = {};
    try {
      body = (await response.json()) as ContactResponseBody;
    } catch {
      body = {};
    }

    if (response.ok && body.success === true) {
      return { ok: true };
    }

    if (response.status === 400 || body.fieldErrors) {
      return {
        ok: false,
        code: "VALIDATION",
        message: CONTACT_FAILURE_MESSAGE,
        fieldErrors: body.fieldErrors,
      };
    }

    return {
      ok: false,
      code: "SERVER",
      message: CONTACT_FAILURE_MESSAGE,
    };
  } catch {
    return {
      ok: false,
      code: "NETWORK",
      message: CONTACT_NETWORK_MESSAGE,
    };
  }
}
