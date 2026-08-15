import { describe, expect, test } from "bun:test";
import { parseChatDataPart, parseToolStatusPart, chatBlocksFromParts, chatBlockFingerprint } from "./index";

describe("parseChatDataPart", () => {
  test("parses a valid project_grid data part", () => {
    const result = parseChatDataPart({ type: "data-projectGrid", data: { type: "project_grid", version: 1, slugs: ["orth-app"] } });
    expect(result).toEqual({ kind: "block", block: { type: "project_grid", version: 1, slugs: ["orth-app"] } });
  });

  test("returns unknown for a malformed data part instead of throwing", () => {
    const result = parseChatDataPart({ type: "data-projectGrid", data: { type: "project_grid", version: 1, slugs: [] } });
    expect(result).toEqual({ kind: "unknown" });
  });

  test("returns null for a non-data part (e.g. text-delta)", () => {
    expect(parseChatDataPart({ type: "text-delta", delta: "hi" })).toBeNull();
  });

  test("is not fooled by a __proto__/constructor-shaped type", () => {
    const result = parseChatDataPart({ type: "constructor", data: {} });
    expect(result).toBeNull();
  });

  test("does not treat data-toolStatus as a block", () => {
    expect(parseChatDataPart({ type: "data-toolStatus", data: { version: 1, activeLabel: "Searching projects" } })).toBeNull();
  });
});

describe("parseToolStatusPart", () => {
  test("parses a valid tool status part", () => {
    const result = parseToolStatusPart({ type: "data-toolStatus", data: { version: 1, activeLabel: "Searching projects" } });
    expect(result).toEqual({ version: 1, activeLabel: "Searching projects" });
  });

  test("returns null for a non-tool-status part", () => {
    expect(parseToolStatusPart({ type: "data-projectGrid", data: {} })).toBeNull();
  });
});

describe("chatBlocksFromParts / chatBlockFingerprint", () => {
  test("extracts only recognized blocks, in order", () => {
    const parts = [
      { type: "text-delta", delta: "hi" },
      { type: "data-projectGrid", data: { type: "project_grid", version: 1, slugs: ["orth-app"] } },
      { type: "data-sourceList", data: { type: "source_list", version: 1, slugs: ["vimi-app"] } },
    ];
    const blocks = chatBlocksFromParts(parts);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({ kind: "block", block: { type: "project_grid" } });
    expect(blocks[1]).toMatchObject({ kind: "block", block: { type: "source_list" } });
  });

  test("fingerprint is stable for the same visible blocks and changes when they change", () => {
    const partsA = [{ type: "data-projectGrid", data: { type: "project_grid", version: 1, slugs: ["orth-app"] } }];
    const partsB = [{ type: "data-projectGrid", data: { type: "project_grid", version: 1, slugs: ["vimi-app"] } }];
    expect(chatBlockFingerprint(partsA)).toBe(chatBlockFingerprint(partsA));
    expect(chatBlockFingerprint(partsA)).not.toBe(chatBlockFingerprint(partsB));
  });
});
