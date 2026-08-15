import { describe, expect, test } from "bun:test";
import { parseSeedQuestion } from "./seedQuestion";

describe("parseSeedQuestion", () => {
  test("returns null for undefined", () => {
    expect(parseSeedQuestion(undefined)).toBeNull();
  });
  test("returns null for an empty string", () => {
    expect(parseSeedQuestion("")).toBeNull();
  });
  test("returns the trimmed, NFC-normalized string for valid input", () => {
    expect(parseSeedQuestion("  What does Mohamed specialize in?  ")).toBe(
      "What does Mohamed specialize in?",
    );
  });
  test("returns null for input over MESSAGE_MAX_LENGTH", () => {
    expect(parseSeedQuestion("a".repeat(4001))).toBeNull();
  });
  test("accepts input at exactly MESSAGE_MAX_LENGTH", () => {
    expect(parseSeedQuestion("a".repeat(4000))).toBe("a".repeat(4000));
  });
});
