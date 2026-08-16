import { describe, expect, test, mock } from "bun:test";
import { createMockMmkv } from "@/lib/storage/mmkv.mock";
import type { CachedTranscript } from "./transcriptCacheLogic";

mock.module("react-native-mmkv", () => ({
  createMMKV: () => createMockMmkv(),
}));

function transcript(overrides: Partial<CachedTranscript> = {}): CachedTranscript {
  return {
    version: 1,
    conversationId: "conv_1",
    snapshotVersion: "2026-08-16T00:00:00.000Z",
    messages: [],
    stoppedIds: [],
    ...overrides,
  };
}

describe("waitForTranscriptCache", () => {
  test("resolves null when nothing is stored", async () => {
    const { waitForTranscriptCache } = await import("./useTranscriptCache");
    expect(await waitForTranscriptCache()).toBeNull();
  });

  test("resolves the debounced-written transcript", async () => {
    const { waitForTranscriptCache, writeDebounced } = await import("./useTranscriptCache");
    writeDebounced(transcript({ conversationId: "conv_2" }));

    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(await waitForTranscriptCache()).toMatchObject({ conversationId: "conv_2" });
  });

  test("coalesces rapid writes into the last value", async () => {
    const { waitForTranscriptCache, writeDebounced } = await import("./useTranscriptCache");
    writeDebounced(transcript({ conversationId: "conv_first" }));
    writeDebounced(transcript({ conversationId: "conv_last" }));

    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(await waitForTranscriptCache()).toMatchObject({ conversationId: "conv_last" });
  });
});
