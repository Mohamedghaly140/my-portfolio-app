import { describe, expect, test } from "bun:test";
import { deriveStreamPhase } from "./streamPhase";

const base = {
  status: "ready" as const,
  connected: true,
  activeToolLabel: null,
  lastTurnStopped: false,
  hasError: false,
};

describe("deriveStreamPhase", () => {
  test("hasError takes priority over everything", () => {
    expect(deriveStreamPhase({ ...base, hasError: true, status: "streaming" })).toBe("failed");
  });
  test("error status maps to failed", () => {
    expect(deriveStreamPhase({ ...base, status: "error" })).toBe("failed");
  });
  test("submitted + not connected", () => {
    expect(deriveStreamPhase({ ...base, status: "submitted", connected: false })).toBe("submitted");
  });
  test("submitted + connected", () => {
    expect(deriveStreamPhase({ ...base, status: "submitted", connected: true })).toBe("connecting");
  });
  test("streaming + active tool label", () => {
    expect(
      deriveStreamPhase({ ...base, status: "streaming", activeToolLabel: "Searching projects" }),
    ).toBe("retrieving");
  });
  test("streaming, no tool label", () => {
    expect(deriveStreamPhase({ ...base, status: "streaming" })).toBe("streaming");
  });
  test("ready + last turn stopped", () => {
    expect(deriveStreamPhase({ ...base, status: "ready", lastTurnStopped: true })).toBe("stopped");
  });
  test("ready, otherwise", () => {
    expect(deriveStreamPhase({ ...base, status: "ready" })).toBe("completed");
  });
});
