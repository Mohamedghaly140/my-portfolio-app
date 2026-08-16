import { describe, expect, mock, test } from "bun:test";

mock.module("expo/fetch", () => ({
  fetch: mock(async () => new Response("{}", { status: 200 })),
}));

mock.module("expo-secure-store", () => {
  let stored: string | null = "v1.stored-session.sig";
  return {
    getItemAsync: mock(async () => stored),
    setItemAsync: mock(async (_key: string, value: string) => {
      stored = value;
    }),
    deleteItemAsync: mock(async () => {
      stored = null;
    }),
  };
});

describe("markdown API", () => {
  test("fetchMarkdown resolves a 200 markdown body", async () => {
    mock.module("expo/fetch", () => ({
      fetch: mock(
        async () =>
          new Response("## Hello\n\nBody text.", {
            status: 200,
            headers: { "content-type": "text/markdown; charset=utf-8" },
          }),
      ),
    }));

    const { fetchMarkdown } = await import("./markdown");
    const result = await fetchMarkdown("/blog/flutter-socketio-streaming");
    expect(result).toBe("## Hello\n\nBody text.");
  });

  test("404 maps to not-found copy via parseMarkdownError", async () => {
    mock.module("expo/fetch", () => ({
      fetch: mock(
        async () =>
          new Response("# Not found\n\nMissing.", {
            status: 404,
            headers: { "content-type": "text/markdown; charset=utf-8" },
          }),
      ),
    }));

    const { fetchMarkdown, parseMarkdownError } = await import("./markdown");

    try {
      await fetchMarkdown("/blog/missing");
      throw new Error("expected fetchMarkdown to throw");
    } catch (error) {
      const parsed = parseMarkdownError(error);
      expect(parsed.message).toBe("Article unavailable.");
      expect(parsed.retryable).toBe(false);
    }
  });

  test("network TypeError maps to network copy", async () => {
    const { parseMarkdownError } = await import("./markdown");
    const parsed = parseMarkdownError(new TypeError("Network request failed"));
    expect(parsed.message).toBe("Check your connection and try again.");
    expect(parsed.retryable).toBe(true);
  });
});
