import { describe, expect, test } from "bun:test";
import { shouldPoll } from "./pollGate";

describe("shouldPoll", () => {
  test("polls when generation is active, no local stream, and app is active", () => {
    expect(
      shouldPoll({ hasActiveGeneration: true, localStreamActive: false, appState: "active" }),
    ).toBe(true);
  });
  test("does not poll when no generation is active", () => {
    expect(
      shouldPoll({ hasActiveGeneration: false, localStreamActive: false, appState: "active" }),
    ).toBe(false);
  });
  test("does not poll while the local stream is already live", () => {
    expect(
      shouldPoll({ hasActiveGeneration: true, localStreamActive: true, appState: "active" }),
    ).toBe(false);
  });
  test("does not poll while backgrounded", () => {
    expect(
      shouldPoll({ hasActiveGeneration: true, localStreamActive: false, appState: "background" }),
    ).toBe(false);
  });
  test("does not poll while inactive", () => {
    expect(
      shouldPoll({ hasActiveGeneration: true, localStreamActive: false, appState: "inactive" }),
    ).toBe(false);
  });
});
