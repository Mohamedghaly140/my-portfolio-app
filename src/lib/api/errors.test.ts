import { describe, expect, test } from "bun:test";
import { parseChatError, CHAT_ERRORS } from "./errors";

describe("parseChatError", () => {
  test("maps a JSON error body by code", () => {
    const error = new Error(JSON.stringify({ error: { code: "RATE_LIMITED" }, requestId: "req_1" }));
    const result = parseChatError(error);
    expect(result.code).toBe("RATE_LIMITED");
    expect(result.message).toBe(CHAT_ERRORS.RATE_LIMITED.message);
    expect(result.retryable).toBe(true);
  });

  test("maps a bare known code string", () => {
    const result = parseChatError(new Error("MESSAGE_BLOCKED"));
    expect(result.code).toBe("MESSAGE_BLOCKED");
    expect(result.retryable).toBe(false);
  });

  test("maps a network TypeError to the client-only NETWORK code", () => {
    const result = parseChatError(new TypeError("Network request failed"));
    expect(result.code).toBe("NETWORK");
    expect(result.retryable).toBe(true);
  });

  test("falls back to INTERNAL for an unrecognized error", () => {
    const result = parseChatError(new Error("something exploded"));
    expect(result.code).toBe("INTERNAL");
  });

  test("falls back to INTERNAL for a non-Error thrown value", () => {
    const result = parseChatError("a string, not an Error");
    expect(result.code).toBe("INTERNAL");
  });
});
