import { describe, expect, test, mock } from "bun:test";
import { createMockMmkv } from "@/lib/storage/mmkv.mock";

mock.module("react-native-mmkv", () => ({
  createMMKV: () => createMockMmkv(),
}));

describe("theme preference storage", () => {
  test("returns null when nothing is stored", async () => {
    const { getStoredThemePreference } = await import("./theme");
    expect(await getStoredThemePreference()).toBeNull();
  });

  test("round-trips a stored preference", async () => {
    const { getStoredThemePreference, setStoredThemePreference } = await import("./theme");
    await setStoredThemePreference("dark");
    expect(await getStoredThemePreference()).toBe("dark");
  });

  test("clearing removes the stored preference", async () => {
    const { getStoredThemePreference, setStoredThemePreference, clearStoredThemePreference } =
      await import("./theme");
    await setStoredThemePreference("light");
    await clearStoredThemePreference();
    expect(await getStoredThemePreference()).toBeNull();
  });
});
