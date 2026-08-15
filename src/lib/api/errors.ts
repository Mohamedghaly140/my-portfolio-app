export const CHAT_ERRORS = {
  VALIDATION: { retryable: false, message: "Check the message and try again." },
  NOT_FOUND: { retryable: false, message: "This conversation is no longer available." },
  LEAD_DRAFT_EXPIRED: { retryable: false, message: "This contact form has expired. Review it and try again." },
  IDEMPOTENCY_CONFLICT: { retryable: false, message: "That message identifier was already used. Send the message again." },
  RETRY_REQUIRED: { retryable: true, message: "That reply ended early. Use Retry to continue this conversation." },
  RATE_LIMITED: { retryable: true, message: "You've sent several messages quickly. Try again shortly." },
  MESSAGE_BLOCKED: { retryable: false, message: "I can't help with that request. Try asking about Mohamed's professional work." },
  SECRET_IN_MESSAGE: { retryable: false, message: "That message looks like it contains a credential or API key. Remove it and try again." },
  BUSY: { retryable: true, message: "A reply is still being written. Wait for it to finish or stop it first." },
  UPSTREAM_TIMEOUT: { retryable: true, message: "The reply took too long. Please retry." },
  AI_UNAVAILABLE: { retryable: true, message: "Mo Ghaly GPT is temporarily unavailable." },
  CONTEXT_UNAVAILABLE: { retryable: true, message: "This conversation is still preparing its context. Please retry shortly." },
  INTERNAL: { retryable: true, message: "Something went wrong. Your message was not lost; please retry." },
  NETWORK: { retryable: true, message: "Check your connection and try again." },
} as const;

export type ChatErrorCode = keyof typeof CHAT_ERRORS;

function isKnownCode(value: string): value is ChatErrorCode {
  return Object.hasOwn(CHAT_ERRORS, value);
}

export function parseChatError(error: unknown): { code: ChatErrorCode; message: string; retryable: boolean } {
  if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
    return { code: "NETWORK", ...CHAT_ERRORS.NETWORK };
  }

  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message) as { error?: { code?: string } };
      const code = parsed.error?.code;
      if (code && isKnownCode(code)) {
        return { code, ...CHAT_ERRORS[code] };
      }
    } catch {
      // not a JSON body — fall through to bare-code check
    }

    if (isKnownCode(error.message)) {
      return { code: error.message, ...CHAT_ERRORS[error.message] };
    }
  }

  return { code: "INTERNAL", ...CHAT_ERRORS.INTERNAL };
}
