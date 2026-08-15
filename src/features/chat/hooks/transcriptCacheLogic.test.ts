import { describe, expect, test } from "bun:test";
import {
  validateCache,
  evictOverflow,
  CACHE_VERSION,
  MAX_TRANSCRIPT_MESSAGES,
} from "./transcriptCacheLogic";
import type { ConversationSnapshot } from "@/lib/api/conversations";

function snapshot(overrides: Partial<ConversationSnapshot> = {}): ConversationSnapshot {
  return {
    id: "conv_1",
    version: "2026-08-16T00:00:00.000Z",
    status: "ACTIVE",
    messages: [],
    hasActiveGeneration: false,
    createdAt: "2026-08-16T00:00:00.000Z",
    updatedAt: "2026-08-16T00:00:00.000Z",
    ...overrides,
  };
}

describe("validateCache", () => {
  test("accepts a cache matching id, version, and CACHE_VERSION", () => {
    const cached = {
      version: CACHE_VERSION,
      conversationId: "conv_1",
      snapshotVersion: "2026-08-16T00:00:00.000Z",
      messages: [],
      stoppedIds: [],
    };
    expect(validateCache(cached, snapshot())).toBe(true);
  });
  test("rejects a cache for a different conversation id", () => {
    const cached = {
      version: CACHE_VERSION,
      conversationId: "conv_other",
      snapshotVersion: "2026-08-16T00:00:00.000Z",
      messages: [],
      stoppedIds: [],
    };
    expect(validateCache(cached, snapshot())).toBe(false);
  });
  test("rejects a cache with a stale snapshot version", () => {
    const cached = {
      version: CACHE_VERSION,
      conversationId: "conv_1",
      snapshotVersion: "2026-01-01T00:00:00.000Z",
      messages: [],
      stoppedIds: [],
    };
    expect(validateCache(cached, snapshot())).toBe(false);
  });
  test("rejects a cache with a mismatched envelope version", () => {
    const cached = {
      version: CACHE_VERSION - 1,
      conversationId: "conv_1",
      snapshotVersion: "2026-08-16T00:00:00.000Z",
      messages: [],
      stoppedIds: [],
    };
    expect(validateCache(cached, snapshot())).toBe(false);
  });
  test("rejects null", () => {
    expect(validateCache(null, snapshot())).toBe(false);
  });
});

describe("evictOverflow", () => {
  test("keeps all messages under the cap", () => {
    const messages = Array.from({ length: 5 }, (_, i) => ({ id: `m${i}` }) as never);
    expect(evictOverflow(messages)).toHaveLength(5);
  });
  test("evicts oldest-first past MAX_TRANSCRIPT_MESSAGES", () => {
    const messages = Array.from({ length: MAX_TRANSCRIPT_MESSAGES + 5 }, (_, i) => ({
      id: `m${i}`,
    }) as never);
    const kept = evictOverflow(messages);
    expect(kept).toHaveLength(MAX_TRANSCRIPT_MESSAGES);
    expect(kept[0]).toMatchObject({ id: "m5" });
  });
});
