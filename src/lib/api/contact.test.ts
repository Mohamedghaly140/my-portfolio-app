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

const values = {
  name: "Jane Doe",
  email: "jane@example.com",
  subject: "Hello",
  message: "This is long enough.",
};

describe("submitContact", () => {
  test("maps {success:true} to {ok:true}", async () => {
    mock.module("expo/fetch", () => ({
      fetch: mock(
        async () =>
          new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
      ),
    }));

    const { submitContact } = await import("./contact");
    await expect(submitContact(values)).resolves.toEqual({ ok: true });
  });

  test("maps a 400 body to VALIDATION with fixed local copy", async () => {
    mock.module("expo/fetch", () => ({
      fetch: mock(
        async () =>
          new Response(
            JSON.stringify({
              error: "server should not leak",
              fieldErrors: { email: ["bad"] },
            }),
            {
              status: 400,
              headers: { "content-type": "application/json" },
            },
          ),
      ),
    }));

    const { submitContact } = await import("./contact");
    const result = await submitContact(values);
    expect(result).toEqual({
      ok: false,
      code: "VALIDATION",
      message: "Failed to send email. Please try again.",
      fieldErrors: { email: ["bad"] },
    });
  });

  test("maps a 500 body to SERVER with fixed local copy", async () => {
    mock.module("expo/fetch", () => ({
      fetch: mock(
        async () =>
          new Response(JSON.stringify({ error: "Failed to send message" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          }),
      ),
    }));

    const { submitContact } = await import("./contact");
    const result = await submitContact(values);
    expect(result).toEqual({
      ok: false,
      code: "SERVER",
      message: "Failed to send email. Please try again.",
    });
  });

  test("maps a thrown network failure to NETWORK", async () => {
    mock.module("expo/fetch", () => ({
      fetch: mock(async () => {
        throw new TypeError("Network request failed");
      }),
    }));

    const { submitContact } = await import("./contact");
    const result = await submitContact(values);
    expect(result).toEqual({
      ok: false,
      code: "NETWORK",
      message: "Check your connection and try again.",
    });
  });
});
