import { describe, expect, test, mock } from "bun:test";

mock.module("expo/fetch", () => ({
  fetch: mock(async (_input: string, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    return new Response(JSON.stringify({ headersSeen: Object.fromEntries(headers) }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }),
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

describe("apiRequest", () => {
  test("injects x-mg-client and x-mg-session headers", async () => {
    const { apiRequest } = await import("./client");
    const response = await apiRequest("/api/conversations");
    const body = (await response.json()) as { headersSeen: Record<string, string> };
    expect(body.headersSeen["x-mg-client"]).toBe("mobile/1.0");
    expect(body.headersSeen["x-mg-session"]).toBe("v1.stored-session.sig");
  });

  test("persists a reissued x-mg-session response header", async () => {
    mock.module("expo/fetch", () => ({
      fetch: mock(async () =>
        new Response("{}", {
          status: 200,
          headers: { "content-type": "application/json", "x-mg-session": "v1.reissued.sig" },
        }),
      ),
    }));
    const { apiRequest } = await import("./client");
    const { getStoredSession } = await import("../session/chatSession");
    await apiRequest("/api/conversations");
    expect(await getStoredSession()).toBe("v1.reissued.sig");
  });
});
