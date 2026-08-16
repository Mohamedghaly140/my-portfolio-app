import { describe, expect, test, mock } from "bun:test";
import { onlineManager } from "@tanstack/react-query";
import { createMockMmkv } from "@/lib/storage/mmkv.mock";

let emitNetInfoChange: ((state: { isConnected: boolean | null }) => void) | undefined;
const unsubscribeNetInfo = mock(() => {});

mock.module("react-native", () => ({
  AppState: { addEventListener: mock(() => ({ remove: mock() })) },
  Platform: { OS: "ios" },
}));

mock.module("react-native-mmkv", () => ({
  createMMKV: () => createMockMmkv(),
}));

mock.module("@react-native-community/netinfo", () => ({
  default: {
    addEventListener: mock((listener: (state: { isConnected: boolean | null }) => void) => {
      emitNetInfoChange = listener;
      return unsubscribeNetInfo;
    }),
  },
}));

describe("isAppStateActive", () => {
  test("is true only for the active state", async () => {
    const { isAppStateActive } = await import("./query-client");
    expect(isAppStateActive("active")).toBe(true);
    expect(isAppStateActive("background")).toBe(false);
    expect(isAppStateActive("inactive")).toBe(false);
  });
});

describe("setupOnlineManager", () => {
  test("flips onlineManager.isOnline() with NetInfo connectivity changes", async () => {
    const { setupOnlineManager } = await import("./query-client");
    setupOnlineManager();

    expect(emitNetInfoChange).toBeDefined();

    emitNetInfoChange?.({ isConnected: true });
    expect(onlineManager.isOnline()).toBe(true);

    emitNetInfoChange?.({ isConnected: null });
    expect(onlineManager.isOnline()).toBe(false);
  });
});

describe("shouldDehydrateQuery", () => {
  test("persists only markdown query keys", async () => {
    const { shouldDehydrateQuery } = await import("./query-client");

    expect(shouldDehydrateQuery({ queryKey: ["markdown", "/blog/some-post"] })).toBe(true);
    expect(shouldDehydrateQuery({ queryKey: ["something-else", "x"] })).toBe(false);
  });
});
