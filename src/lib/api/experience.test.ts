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

describe("experience API", () => {
  test("fetchExperience resolves the mocked data array", async () => {
    const payload = {
      data: [
        {
          company: "Acme",
          role: "Engineer",
          period: "2024 — Present",
          location: "Remote",
          description: "Building things.",
          tags: ["TypeScript"],
          current: true,
        },
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

    const { fetchExperience } = await import("./experience");
    const result = await fetchExperience();
    expect(result).toEqual(payload.data);
  });

  test("non-2xx response throws", async () => {
    mock.module("expo/fetch", () => ({
      fetch: mock(
        async () =>
          new Response(JSON.stringify({ error: "fail" }), {
            status: 404,
            headers: { "content-type": "application/json" },
          }),
      ),
    }));

    const { fetchExperience } = await import("./experience");

    try {
      await fetchExperience();
      throw new Error("expected fetchExperience to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe("404");
    }
  });
});
