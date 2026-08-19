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

describe("stats API", () => {
  test("fetchStats resolves the mocked data array", async () => {
    const payload = {
      data: [
        { value: "5+", label: "Years Exp" },
        { value: "3+", label: "Tech Stacks" },
      ],
    };

    mock.module("expo/fetch", () => ({
      fetch: mock(
        async () =>
          new Response(JSON.stringify(payload), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
      ),
    }));

    const { fetchStats } = await import("./stats");
    const result = await fetchStats();
    expect(result).toEqual(payload.data);
  });

  test("non-2xx response throws", async () => {
    mock.module("expo/fetch", () => ({
      fetch: mock(
        async () =>
          new Response(JSON.stringify({ error: "fail" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          }),
      ),
    }));

    const { fetchStats } = await import("./stats");

    try {
      await fetchStats();
      throw new Error("expected fetchStats to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe("500");
    }
  });
});
