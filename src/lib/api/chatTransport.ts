import { DefaultChatTransport } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import type { UIMessage } from "ai";
import { getStoredSession, setStoredSession } from "../session/chatSession";

const API_ORIGIN = process.env.EXPO_PUBLIC_API_ORIGIN;

export type ChatUIMessage = UIMessage<unknown, Record<string, unknown>>;

export function createChatTransport(args: {
  conversationId: string;
  onResponse: (response: Response) => void;
}): DefaultChatTransport<ChatUIMessage> {
  return new DefaultChatTransport<ChatUIMessage>({
    api: `${API_ORIGIN}/api/chat`,
    fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
      const session = await getStoredSession();
      const headers = new Headers(init?.headers);
      if (API_ORIGIN) headers.set("origin", API_ORIGIN);
      headers.set("x-mg-client", "mobile/1.0");
      if (session) headers.set("x-mg-session", session);
      const response = await expoFetch(input as string, { ...init, headers });
      const reissued = response.headers.get("x-mg-session");
      if (reissued) await setStoredSession(reissued);
      args.onResponse(response);
      return response;
    }) as unknown as typeof fetch,
    prepareSendMessagesRequest: ({ messages, trigger, messageId }) => {
      if (trigger === "regenerate-message") {
        if (!messageId) throw new Error("Retry requires an assistant message id.");
        return {
          api: `${API_ORIGIN}/api/messages/${encodeURIComponent(messageId)}/retry`,
          body: { clientRetryId: crypto.randomUUID(), locale: "en" },
        };
      }
      const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
      const text = lastUserMessage?.parts
        .filter((part): part is { type: "text"; text: string } => part.type === "text")
        .map((part) => part.text)
        .join("") ?? "";
      return {
        body: {
          conversationId: args.conversationId,
          message: text,
          clientMessageId: crypto.randomUUID(),
          locale: "en",
        },
      };
    },
  });
}
