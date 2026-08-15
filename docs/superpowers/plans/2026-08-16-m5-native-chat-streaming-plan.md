# M5 — Chat Tab, Native Streaming — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Project override:** per this repo's `CLAUDE.md` ("Delegating implementation"), the *typing* of every task below is done by Cursor via the `cursor-delegate` skill, not by an in-session subagent. Claude (the executor of this plan) writes each brief, re-runs the gates itself, reads the whole diff, and commits — Cursor never runs `git add`/`git commit`. See "Delegation slices" below for how tasks map to briefs.

**Goal:** Ship a fully native, streaming Mo Ghaly GPT chat experience — session persistence, `expo/fetch` streaming transport, block rendering resolved against bundled data, a restore/poll/stop/retry state machine, and local-copy-only error handling — satisfying the M5 exit criterion.

**Architecture:** Four layers, each independently testable: `src/lib/session/` (secure-store), `src/lib/api/` (single authenticated `expo/fetch` client + conversations/transport/errors), `src/features/chat/` (block parsers, hooks, components), and thin screen wiring in `src/app/(tabs)/(chat)/`. Pure logic (parsers, error mapping, phase derivation, cache validation, poll-gate) is separated from RN-runtime glue (AsyncStorage, secure-store, `AppState`, `useChat`) so the former is bun-testable and the latter is device-verified.

**Tech Stack:** Expo SDK 57, `expo/fetch`, `@ai-sdk/react` `useChat`, `ai` `DefaultChatTransport`, `expo-secure-store`, `@react-native-async-storage/async-storage` (new dep), `zod`, TypeScript strict, `bun test`.

**Spec:** `docs/superpowers/specs/2026-08-16-m5-native-chat-streaming-design.md` — this plan argues from that spec; read both.

## Global Constraints

- No `StyleSheet.create(...)` inside a component's render body — module scope only (`CLAUDE.md`).
- Radius is `0` everywhere; no rounded corners on chat bubbles, composer, or block cards.
- Icons only from `@expo/vector-icons` (`Ionicons`); no other icon library.
- `Button`'s `icon` prop for send/stop/retry — never an embedded arrow character in a label string.
- Haptics only via `src/lib/haptics.ts` (`lightImpact()` / `selectionChanged()`) — never call `expo-haptics` directly from a screen or feature component.
- Chat streaming uses `expo/fetch`, never the global `fetch` (D5) — RN's default `fetch` returns `response.body === null`.
- Chat UI blocks carry slugs/status only; resolve titles/URLs/contact details against bundled `src/data/` — never render a wire-supplied title, URL, or phone number (D7).
- Never render server-supplied `error.message` text or a raw JS error's `.message` — always the local `CHAT_ERRORS` copy table keyed by wire `code`.
- Every mutating/streaming request carries `x-mg-client: mobile/1.0` and `x-mg-session: <stored value>`; a reissued `x-mg-session` response header must be persisted back to Secure Store.
- Stop always calls `POST /api/conversations/{id}/cancel` in addition to aborting the local stream — RN abort propagation to the server is unreliable, this is not optional.
- `MESSAGE_MAX_LENGTH = 4000` (codepoints), NFC-normalized.
- `lead_form` / `contact_handoff` blocks are non-interactive placeholders in this phase — real submitting UI is M6.
- Gates for every task: `bunx tsc --noEmit`, `bun run lint`, `bun test` (for files with tests) all green before commit.

---

## Delegation slices

Each slice below is one `cursor-delegate` brief (`docs/superpowers/specs/2026-08-16-m5-native-chat-streaming-design.md` is named in every brief so Cursor can pull exact type shapes without them being restated). Dispatch sequentially — start the next slice's brief only after the previous diff is reviewed, gates re-run locally, and committed.

| Slice | Tasks | Deliverable |
|---|---|---|
| 1 | 1–3 | Data layer: session store, API client, conversations, transport, errors |
| 2 | 4 | Block parsers |
| 3 | 5–6 | Pure logic: stream phase, transcript-cache validation, poll-gate predicate, config/seed-question |
| 4 | 7 | RN-runtime hooks: transcript cache, boot, polling, chat-session composition |
| 5 | 8–9 | UI components: shell/list/composer/status/error + block renderers |
| 6 | 10 | Screen wiring + dependency install + device verification |

---

## Task 1: Session store + API client core

**Files:**
- Create: `src/lib/session/chatSession.ts`
- Create: `src/lib/api/client.ts`
- Test: `src/lib/api/client.test.ts`

**Interfaces:**
- Produces: `getStoredSession(): Promise<string | null>`, `setStoredSession(value: string): Promise<void>`, `clearStoredSession(): Promise<void>` (from `chatSession.ts`); `apiRequest(path: string, init?: RequestInit): Promise<Response>` (from `client.ts`) — every later task's HTTP calls go through `apiRequest`, never raw `fetch`/`expo/fetch` directly.

- [ ] **Step 1: Write `chatSession.ts`**

```ts
import * as SecureStore from "expo-secure-store";

const SESSION_KEY = "mg_chat_session";

export async function getStoredSession(): Promise<string | null> {
  return SecureStore.getItemAsync(SESSION_KEY);
}

export async function setStoredSession(value: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, value);
}

export async function clearStoredSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
```

- [ ] **Step 2: Write the failing test for `apiRequest`'s header injection**

```ts
// src/lib/api/client.test.ts
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
```

- [ ] **Step 3: Run test to verify it fails**

Run: `bun test src/lib/api/client.test.ts`
Expected: FAIL — `client.ts` does not exist yet.

- [ ] **Step 4: Write `client.ts`**

```ts
import { fetch as expoFetch } from "expo/fetch";
import { getStoredSession, setStoredSession } from "../session/chatSession";

const API_ORIGIN = process.env.EXPO_PUBLIC_API_ORIGIN;

export async function apiRequest(path: string, init: RequestInit = {}): Promise<Response> {
  if (!API_ORIGIN) {
    throw new Error("EXPO_PUBLIC_API_ORIGIN is not set");
  }
  const session = await getStoredSession();
  const headers = new Headers(init.headers);
  headers.set("origin", API_ORIGIN);
  headers.set("x-mg-client", "mobile/1.0");
  if (session) headers.set("x-mg-session", session);
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await expoFetch(`${API_ORIGIN}${path}`, { ...init, headers });

  const reissued = response.headers.get("x-mg-session");
  if (reissued) await setStoredSession(reissued);

  return response;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `bun test src/lib/api/client.test.ts`
Expected: PASS (both cases)

- [ ] **Step 6: Gates and commit**

```bash
bunx tsc --noEmit && bun run lint && bun test src/lib/api/client.test.ts
git add src/lib/session/chatSession.ts src/lib/api/client.ts src/lib/api/client.test.ts
git commit -m "feat: add chat session store and authenticated API client"
```

---

## Task 2: Conversations API + chat transport

**Files:**
- Create: `src/lib/api/conversations.ts`
- Create: `src/lib/api/chatTransport.ts`

**Interfaces:**
- Consumes: `apiRequest` from Task 1.
- Produces: `ConversationSnapshot`, `ConversationSnapshotMessage`, `ConversationSnapshotPart`, `ConversationMessageStatus` types; `fetchLatestConversation()`, `createConversation()`, `fetchConversation(id)`, `cancelConversation(id)`, `deleteConversation(id)`; `createChatTransport({ conversationId, onResponse })` returning a `DefaultChatTransport<ChatUIMessage>`. Later tasks (boot, chat-session hook, message list) import these types and functions directly — do not redefine `ConversationSnapshot` elsewhere.

- [ ] **Step 1: Write `conversations.ts`**

```ts
import { apiRequest } from "./client";
import type { ProjectGridBlock, SourceListBlock, LeadFormBlock, ContactHandoffBlock } from "@/features/chat/blocks";

export type ConversationMessageStatus =
  | "PENDING" | "STREAMING" | "COMPLETED" | "FAILED" | "CANCELLED" | "BLOCKED";

export type ConversationSnapshotPart =
  | { type: "text"; text: string }
  | { type: "data-projectGrid"; data: ProjectGridBlock }
  | { type: "data-sourceList"; data: SourceListBlock }
  | { type: "data-leadForm"; data: LeadFormBlock }
  | { type: "data-contactHandoff"; data: ContactHandoffBlock };

export type ConversationSnapshotMessage = {
  id: string;
  role: "user" | "assistant";
  status: ConversationMessageStatus;
  parts: ConversationSnapshotPart[];
  createdAt: string;
  completedAt: string | null;
};

export type ConversationSnapshot = {
  id: string;
  version: string;
  status: "ACTIVE";
  messages: ConversationSnapshotMessage[];
  hasActiveGeneration: boolean;
  createdAt: string;
  updatedAt: string;
};

async function parseConversation(response: Response): Promise<ConversationSnapshot> {
  const body = (await response.json()) as { conversation: ConversationSnapshot };
  return body.conversation;
}

export async function fetchLatestConversation(): Promise<ConversationSnapshot | null> {
  const response = await apiRequest("/api/conversations");
  const body = (await response.json()) as { conversation: ConversationSnapshot | null };
  return body.conversation;
}

export async function createConversation(): Promise<ConversationSnapshot> {
  const response = await apiRequest("/api/conversations", { method: "POST", body: "{}" });
  return parseConversation(response);
}

export async function fetchConversation(id: string): Promise<ConversationSnapshot> {
  const response = await apiRequest(`/api/conversations/${encodeURIComponent(id)}`);
  return parseConversation(response);
}

export async function cancelConversation(id: string): Promise<void> {
  await apiRequest(`/api/conversations/${encodeURIComponent(id)}/cancel`, { method: "POST", body: "{}" });
}

export async function deleteConversation(id: string): Promise<void> {
  await apiRequest(`/api/conversations/${encodeURIComponent(id)}`, { method: "DELETE" });
}
```

- [ ] **Step 2: Write `chatTransport.ts`**

```ts
import { DefaultChatTransport } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import { randomUUID } from "expo-crypto";
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
    fetch: (async (input, init) => {
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
    }) as typeof fetch,
    prepareSendMessagesRequest: ({ messages, trigger, messageId }) => {
      if (trigger === "regenerate-message") {
        if (!messageId) throw new Error("Retry requires an assistant message id.");
        return {
          api: `${API_ORIGIN}/api/messages/${encodeURIComponent(messageId)}/retry`,
          body: { clientRetryId: randomUUID(), locale: "en" },
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
          clientMessageId: randomUUID(),
          locale: "en",
        },
      };
    },
  });
}
```

Note: `expo-crypto`'s `randomUUID` is used for id generation (already available via Expo SDK; if not present, `crypto.randomUUID()` from the RN 0.86 global is an equivalent fallback — verify which is available at implementation time and use one consistently).

- [ ] **Step 3: Gates and commit**

```bash
bunx tsc --noEmit && bun run lint
git add src/lib/api/conversations.ts src/lib/api/chatTransport.ts
git commit -m "feat: add conversations API and chat streaming transport"
```

(No dedicated test file for this task — both modules are thin wiring over `apiRequest`/`DefaultChatTransport`, exercised end-to-end by Task 7's hook tests and device verification in Task 10.)

---

## Task 3: Error table + `parseChatError`

**Files:**
- Create: `src/lib/api/errors.ts`
- Test: `src/lib/api/errors.test.ts`

**Interfaces:**
- Produces: `ChatErrorCode` union, `CHAT_ERRORS` table, `parseChatError(error: unknown): { code: string; message: string; retryable: boolean }`. Every later task that surfaces an error (ErrorNotice, useChatSession) imports `parseChatError` — no other module re-implements error-code-to-copy mapping.

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/api/errors.test.ts
import { describe, expect, test } from "bun:test";
import { parseChatError, CHAT_ERRORS } from "./errors";

describe("parseChatError", () => {
  test("maps a JSON error body by code", () => {
    const error = new Error(JSON.stringify({ error: { code: "RATE_LIMITED" }, requestId: "req_1" }));
    const result = parseChatError(error);
    expect(result.code).toBe("RATE_LIMITED");
    expect(result.message).toBe(CHAT_ERRORS.RATE_LIMITED.message);
    expect(result.retryable).toBe(true);
  });

  test("maps a bare known code string", () => {
    const result = parseChatError(new Error("MESSAGE_BLOCKED"));
    expect(result.code).toBe("MESSAGE_BLOCKED");
    expect(result.retryable).toBe(false);
  });

  test("maps a network TypeError to the client-only NETWORK code", () => {
    const result = parseChatError(new TypeError("Network request failed"));
    expect(result.code).toBe("NETWORK");
    expect(result.retryable).toBe(true);
  });

  test("falls back to INTERNAL for an unrecognized error", () => {
    const result = parseChatError(new Error("something exploded"));
    expect(result.code).toBe("INTERNAL");
  });

  test("falls back to INTERNAL for a non-Error thrown value", () => {
    const result = parseChatError("a string, not an Error");
    expect(result.code).toBe("INTERNAL");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `bun test src/lib/api/errors.test.ts`
Expected: FAIL — `errors.ts` does not exist.

- [ ] **Step 3: Write `errors.ts`**

```ts
export const CHAT_ERRORS = {
  VALIDATION: { retryable: false, message: "Check the message and try again." },
  NOT_FOUND: { retryable: false, message: "This conversation is no longer available." },
  LEAD_DRAFT_EXPIRED: { retryable: false, message: "This contact form has expired. Review it and try again." },
  IDEMPOTENCY_CONFLICT: { retryable: false, message: "That message identifier was already used. Send the message again." },
  RETRY_REQUIRED: { retryable: true, message: "That reply ended early. Use Retry to continue this conversation." },
  RATE_LIMITED: { retryable: true, message: "You've sent several messages quickly. Try again shortly." },
  MESSAGE_BLOCKED: { retryable: false, message: "I can't help with that request. Try asking about Mohamed's professional work." },
  SECRET_IN_MESSAGE: { retryable: false, message: "That message looks like it contains a credential or API key. Remove it and try again." },
  BUSY: { retryable: true, message: "A reply is still being written. Wait for it to finish or stop it first." },
  UPSTREAM_TIMEOUT: { retryable: true, message: "The reply took too long. Please retry." },
  AI_UNAVAILABLE: { retryable: true, message: "Mo Ghaly GPT is temporarily unavailable." },
  CONTEXT_UNAVAILABLE: { retryable: true, message: "This conversation is still preparing its context. Please retry shortly." },
  INTERNAL: { retryable: true, message: "Something went wrong. Your message was not lost; please retry." },
  NETWORK: { retryable: true, message: "Check your connection and try again." },
} as const;

export type ChatErrorCode = keyof typeof CHAT_ERRORS;

function isKnownCode(value: string): value is ChatErrorCode {
  return Object.hasOwn(CHAT_ERRORS, value);
}

export function parseChatError(error: unknown): { code: ChatErrorCode; message: string; retryable: boolean } {
  if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
    return { code: "NETWORK", ...CHAT_ERRORS.NETWORK };
  }

  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message) as { error?: { code?: string } };
      const code = parsed.error?.code;
      if (code && isKnownCode(code)) {
        return { code, ...CHAT_ERRORS[code] };
      }
    } catch {
      // not a JSON body — fall through to bare-code check
    }

    if (isKnownCode(error.message)) {
      return { code: error.message, ...CHAT_ERRORS[error.message] };
    }
  }

  return { code: "INTERNAL", ...CHAT_ERRORS.INTERNAL };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `bun test src/lib/api/errors.test.ts`
Expected: PASS (all 5 cases)

- [ ] **Step 5: Gates and commit**

```bash
bunx tsc --noEmit && bun run lint && bun test src/lib/api/errors.test.ts
git add src/lib/api/errors.ts src/lib/api/errors.test.ts
git commit -m "feat: add local chat error table and parseChatError"
```

---

## Task 4: Block parsers

**Files:**
- Create: `src/features/chat/blocks/index.ts`
- Test: `src/features/chat/blocks/index.test.ts`

**Interfaces:**
- Produces: `ProjectGridBlock`, `SourceListBlock`, `LeadFormBlock`, `ContactHandoffBlock`, `ChatUIBlock` (union), `ToolStatus`, `CHAT_BLOCK_DATA_PART_NAME`, `parseChatDataPart(part: unknown)`, `parseToolStatusPart(part: unknown)`, `chatBlocksFromParts(parts: readonly unknown[])`, `chatBlockFingerprint(parts: readonly unknown[])`. Task 2's `ConversationSnapshotPart` imports these block types; Task 9's block-renderer components consume `chatBlocksFromParts`' output.

- [ ] **Step 1: Write the failing tests**

```ts
// src/features/chat/blocks/index.test.ts
import { describe, expect, test } from "bun:test";
import { parseChatDataPart, parseToolStatusPart, chatBlocksFromParts, chatBlockFingerprint } from "./index";

describe("parseChatDataPart", () => {
  test("parses a valid project_grid data part", () => {
    const result = parseChatDataPart({ type: "data-projectGrid", data: { type: "project_grid", version: 1, slugs: ["orth-app"] } });
    expect(result).toEqual({ kind: "block", block: { type: "project_grid", version: 1, slugs: ["orth-app"] } });
  });

  test("returns unknown for a malformed data part instead of throwing", () => {
    const result = parseChatDataPart({ type: "data-projectGrid", data: { type: "project_grid", version: 1, slugs: [] } });
    expect(result).toEqual({ kind: "unknown" });
  });

  test("returns null for a non-data part (e.g. text-delta)", () => {
    expect(parseChatDataPart({ type: "text-delta", delta: "hi" })).toBeNull();
  });

  test("is not fooled by a __proto__/constructor-shaped type", () => {
    const result = parseChatDataPart({ type: "constructor", data: {} });
    expect(result).toEqual({ kind: "unknown" });
  });

  test("does not treat data-toolStatus as a block", () => {
    expect(parseChatDataPart({ type: "data-toolStatus", data: { version: 1, activeLabel: "Searching projects" } })).toBeNull();
  });
});

describe("parseToolStatusPart", () => {
  test("parses a valid tool status part", () => {
    const result = parseToolStatusPart({ type: "data-toolStatus", data: { version: 1, activeLabel: "Searching projects" } });
    expect(result).toEqual({ version: 1, activeLabel: "Searching projects" });
  });

  test("returns null for a non-tool-status part", () => {
    expect(parseToolStatusPart({ type: "data-projectGrid", data: {} })).toBeNull();
  });
});

describe("chatBlocksFromParts / chatBlockFingerprint", () => {
  test("extracts only recognized blocks, in order", () => {
    const parts = [
      { type: "text-delta", delta: "hi" },
      { type: "data-projectGrid", data: { type: "project_grid", version: 1, slugs: ["orth-app"] } },
      { type: "data-sourceList", data: { type: "source_list", version: 1, slugs: ["vimi-app"] } },
    ];
    const blocks = chatBlocksFromParts(parts);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({ type: "project_grid" });
    expect(blocks[1]).toMatchObject({ type: "source_list" });
  });

  test("fingerprint is stable for the same visible blocks and changes when they change", () => {
    const partsA = [{ type: "data-projectGrid", data: { type: "project_grid", version: 1, slugs: ["orth-app"] } }];
    const partsB = [{ type: "data-projectGrid", data: { type: "project_grid", version: 1, slugs: ["vimi-app"] } }];
    expect(chatBlockFingerprint(partsA)).toBe(chatBlockFingerprint(partsA));
    expect(chatBlockFingerprint(partsA)).not.toBe(chatBlockFingerprint(partsB));
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `bun test src/features/chat/blocks/index.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Write `index.ts`**

```ts
import { z } from "zod";

const canonicalSlug = /^[a-z0-9-]{1,64}$/;
const uniqueSlugsSchema = z
  .array(z.string().regex(canonicalSlug))
  .min(1)
  .max(6)
  .refine((slugs) => new Set(slugs).size === slugs.length, "slugs must be unique");

export const projectGridBlockSchema = z.strictObject({
  type: z.literal("project_grid"),
  version: z.literal(1),
  slugs: uniqueSlugsSchema,
});

export const sourceListBlockSchema = z.strictObject({
  type: z.literal("source_list"),
  version: z.literal(1),
  slugs: uniqueSlugsSchema,
});

export const leadFormBlockSchema = z.strictObject({
  type: z.literal("lead_form"),
  version: z.literal(1),
  draft: z.strictObject({
    opportunityType: z.string().nullable(),
    summary: z.string().max(1000).nullable(),
    technologies: z.array(z.string().max(80)).max(20),
    timeline: z.string().max(240).nullable(),
    projectStage: z.string().max(160).nullable(),
    primaryTechnicalProblem: z.string().max(1000).nullable(),
  }),
});

export const contactHandoffBlockSchema = z.strictObject({
  type: z.literal("contact_handoff"),
  version: z.literal(1),
  status: z.enum(["ready", "submitted", "failed"]),
  leadReference: z.string().max(64).optional(),
});

export const toolStatusSchema = z.strictObject({
  version: z.literal(1),
  activeLabel: z.string().min(1).max(60).nullable(),
});

export const chatUIBlockSchema = z.discriminatedUnion("type", [
  projectGridBlockSchema,
  sourceListBlockSchema,
  leadFormBlockSchema,
  contactHandoffBlockSchema,
]);

export type ProjectGridBlock = z.infer<typeof projectGridBlockSchema>;
export type SourceListBlock = z.infer<typeof sourceListBlockSchema>;
export type LeadFormBlock = z.infer<typeof leadFormBlockSchema>;
export type ContactHandoffBlock = z.infer<typeof contactHandoffBlockSchema>;
export type ChatUIBlock = z.infer<typeof chatUIBlockSchema>;
export type ToolStatus = z.infer<typeof toolStatusSchema>;

export const CHAT_BLOCK_DATA_PART_NAME = {
  project_grid: "data-projectGrid",
  source_list: "data-sourceList",
  lead_form: "data-leadForm",
  contact_handoff: "data-contactHandoff",
} as const;

const blockSchemaByDataPartName: Record<string, z.ZodTypeAny> = {
  "data-projectGrid": projectGridBlockSchema,
  "data-sourceList": sourceListBlockSchema,
  "data-leadForm": leadFormBlockSchema,
  "data-contactHandoff": contactHandoffBlockSchema,
};

export type ParsedChatDataPart = { kind: "block"; block: ChatUIBlock } | { kind: "unknown" } | null;

export function parseChatDataPart(part: unknown): ParsedChatDataPart {
  if (typeof part !== "object" || part === null || !("type" in part)) return null;
  const { type } = part as { type: unknown };
  if (typeof type !== "string") return null;
  if (type === "data-toolStatus") return null;
  if (!Object.hasOwn(blockSchemaByDataPartName, type)) return null;

  const schema = blockSchemaByDataPartName[type];
  const data = "data" in part ? (part as { data: unknown }).data : undefined;
  const result = schema.safeParse(data);
  return result.success ? { kind: "block", block: result.data as ChatUIBlock } : { kind: "unknown" };
}

export function parseToolStatusPart(part: unknown): ToolStatus | null {
  if (typeof part !== "object" || part === null || !("type" in part)) return null;
  if ((part as { type: unknown }).type !== "data-toolStatus") return null;
  const data = "data" in part ? (part as { data: unknown }).data : undefined;
  const result = toolStatusSchema.safeParse(data);
  return result.success ? result.data : null;
}

export type RenderableChatBlock = { kind: "block"; block: ChatUIBlock } | { kind: "unknown" };

export function chatBlocksFromParts(parts: readonly unknown[]): RenderableChatBlock[] {
  const blocks: RenderableChatBlock[] = [];
  for (const part of parts) {
    const parsed = parseChatDataPart(part);
    if (parsed !== null) blocks.push(parsed);
  }
  return blocks;
}

export function chatBlockFingerprint(parts: readonly unknown[]): string {
  return chatBlocksFromParts(parts)
    .map((entry) => (entry.kind === "unknown" ? "unknown" : `${entry.block.type}:v${entry.block.version}`))
    .join("|");
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `bun test src/features/chat/blocks/index.test.ts`
Expected: PASS (all cases)

- [ ] **Step 5: Gates and commit**

```bash
bunx tsc --noEmit && bun run lint && bun test src/features/chat/blocks/index.test.ts
git add src/features/chat/blocks/index.ts src/features/chat/blocks/index.test.ts
git commit -m "feat: add chat UI block parsers"
```

---

## Task 5: Pure logic — stream phase, transcript-cache validation, poll-gate predicate

**Files:**
- Create: `src/features/chat/hooks/streamPhase.ts`
- Create: `src/features/chat/hooks/transcriptCacheLogic.ts`
- Create: `src/features/chat/hooks/pollGate.ts`
- Test: `src/features/chat/hooks/streamPhase.test.ts`
- Test: `src/features/chat/hooks/transcriptCacheLogic.test.ts`
- Test: `src/features/chat/hooks/pollGate.test.ts`

**Interfaces:**
- Consumes: `ConversationSnapshotMessage` type from Task 2.
- Produces: `StreamPhase` type + `deriveStreamPhase(input)`; `CachedTranscript` type + `validateCache(cached, snapshot)` + `evictOverflow(messages)`; `shouldPoll(input)`. Task 7's `useConversationBoot`/`useTranscriptCache`/`usePollingRefresh` hooks call these directly rather than reimplementing the logic inline.

- [ ] **Step 1: Write failing tests for `streamPhase`**

```ts
// src/features/chat/hooks/streamPhase.test.ts
import { describe, expect, test } from "bun:test";
import { deriveStreamPhase } from "./streamPhase";

const base = { status: "ready" as const, connected: true, activeToolLabel: null, lastTurnStopped: false, hasError: false };

describe("deriveStreamPhase", () => {
  test("hasError takes priority over everything", () => {
    expect(deriveStreamPhase({ ...base, hasError: true, status: "streaming" })).toBe("failed");
  });
  test("error status maps to failed", () => {
    expect(deriveStreamPhase({ ...base, status: "error" })).toBe("failed");
  });
  test("submitted + not connected", () => {
    expect(deriveStreamPhase({ ...base, status: "submitted", connected: false })).toBe("submitted");
  });
  test("submitted + connected", () => {
    expect(deriveStreamPhase({ ...base, status: "submitted", connected: true })).toBe("connecting");
  });
  test("streaming + active tool label", () => {
    expect(deriveStreamPhase({ ...base, status: "streaming", activeToolLabel: "Searching projects" })).toBe("retrieving");
  });
  test("streaming, no tool label", () => {
    expect(deriveStreamPhase({ ...base, status: "streaming" })).toBe("streaming");
  });
  test("ready + last turn stopped", () => {
    expect(deriveStreamPhase({ ...base, status: "ready", lastTurnStopped: true })).toBe("stopped");
  });
  test("ready, otherwise", () => {
    expect(deriveStreamPhase({ ...base, status: "ready" })).toBe("completed");
  });
});
```

- [ ] **Step 2: Run to verify it fails, then write `streamPhase.ts`**

```ts
export type StreamPhase = "submitted" | "connecting" | "retrieving" | "streaming" | "completed" | "stopped" | "failed";

export function deriveStreamPhase(input: {
  status: "submitted" | "streaming" | "ready" | "error";
  connected: boolean;
  activeToolLabel: string | null;
  lastTurnStopped: boolean;
  hasError: boolean;
}): StreamPhase {
  if (input.hasError || input.status === "error") return "failed";
  if (input.status === "submitted" && !input.connected) return "submitted";
  if (input.status === "submitted" && input.connected) return "connecting";
  if (input.status === "streaming" && input.activeToolLabel) return "retrieving";
  if (input.status === "streaming") return "streaming";
  if (input.status === "ready" && input.lastTurnStopped) return "stopped";
  return "completed";
}
```

Run `bun test src/features/chat/hooks/streamPhase.test.ts` — expect PASS.

- [ ] **Step 3: Write failing tests for `transcriptCacheLogic`**

```ts
// src/features/chat/hooks/transcriptCacheLogic.test.ts
import { describe, expect, test } from "bun:test";
import { validateCache, evictOverflow, CACHE_VERSION, MAX_TRANSCRIPT_MESSAGES } from "./transcriptCacheLogic";
import type { ConversationSnapshot } from "@/lib/api/conversations";

function snapshot(overrides: Partial<ConversationSnapshot> = {}): ConversationSnapshot {
  return {
    id: "conv_1", version: "2026-08-16T00:00:00.000Z", status: "ACTIVE",
    messages: [], hasActiveGeneration: false,
    createdAt: "2026-08-16T00:00:00.000Z", updatedAt: "2026-08-16T00:00:00.000Z",
    ...overrides,
  };
}

describe("validateCache", () => {
  test("accepts a cache matching id, version, and CACHE_VERSION", () => {
    const cached = { version: CACHE_VERSION, conversationId: "conv_1", snapshotVersion: "2026-08-16T00:00:00.000Z", messages: [], stoppedIds: [] };
    expect(validateCache(cached, snapshot())).toBe(true);
  });
  test("rejects a cache for a different conversation id", () => {
    const cached = { version: CACHE_VERSION, conversationId: "conv_other", snapshotVersion: "2026-08-16T00:00:00.000Z", messages: [], stoppedIds: [] };
    expect(validateCache(cached, snapshot())).toBe(false);
  });
  test("rejects a cache with a stale snapshot version", () => {
    const cached = { version: CACHE_VERSION, conversationId: "conv_1", snapshotVersion: "2026-01-01T00:00:00.000Z", messages: [], stoppedIds: [] };
    expect(validateCache(cached, snapshot())).toBe(false);
  });
  test("rejects a cache with a mismatched envelope version", () => {
    const cached = { version: CACHE_VERSION - 1, conversationId: "conv_1", snapshotVersion: "2026-08-16T00:00:00.000Z", messages: [], stoppedIds: [] };
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
    const messages = Array.from({ length: MAX_TRANSCRIPT_MESSAGES + 5 }, (_, i) => ({ id: `m${i}` }) as never);
    const kept = evictOverflow(messages);
    expect(kept).toHaveLength(MAX_TRANSCRIPT_MESSAGES);
    expect(kept[0]).toMatchObject({ id: "m5" });
  });
});
```

- [ ] **Step 4: Run to verify it fails, then write `transcriptCacheLogic.ts`**

```ts
import type { ConversationSnapshot, ConversationSnapshotMessage } from "@/lib/api/conversations";

export const CACHE_VERSION = 1;
export const MAX_TRANSCRIPT_MESSAGES = 40;

export type CachedTranscript = {
  version: number;
  conversationId: string;
  snapshotVersion: string;
  messages: ConversationSnapshotMessage[];
  stoppedIds: string[];
};

export function validateCache(cached: CachedTranscript | null, snapshot: ConversationSnapshot): boolean {
  if (!cached) return false;
  return (
    cached.version === CACHE_VERSION &&
    cached.conversationId === snapshot.id &&
    cached.snapshotVersion === snapshot.version
  );
}

export function evictOverflow(messages: ConversationSnapshotMessage[]): ConversationSnapshotMessage[] {
  if (messages.length <= MAX_TRANSCRIPT_MESSAGES) return messages;
  return messages.slice(messages.length - MAX_TRANSCRIPT_MESSAGES);
}
```

Run `bun test src/features/chat/hooks/transcriptCacheLogic.test.ts` — expect PASS.

- [ ] **Step 5: Write failing tests for `pollGate`**

```ts
// src/features/chat/hooks/pollGate.test.ts
import { describe, expect, test } from "bun:test";
import { shouldPoll } from "./pollGate";

describe("shouldPoll", () => {
  test("polls when generation is active, no local stream, and app is active", () => {
    expect(shouldPoll({ hasActiveGeneration: true, localStreamActive: false, appState: "active" })).toBe(true);
  });
  test("does not poll when no generation is active", () => {
    expect(shouldPoll({ hasActiveGeneration: false, localStreamActive: false, appState: "active" })).toBe(false);
  });
  test("does not poll while the local stream is already live", () => {
    expect(shouldPoll({ hasActiveGeneration: true, localStreamActive: true, appState: "active" })).toBe(false);
  });
  test("does not poll while backgrounded", () => {
    expect(shouldPoll({ hasActiveGeneration: true, localStreamActive: false, appState: "background" })).toBe(false);
  });
  test("does not poll while inactive", () => {
    expect(shouldPoll({ hasActiveGeneration: true, localStreamActive: false, appState: "inactive" })).toBe(false);
  });
});
```

- [ ] **Step 6: Run to verify it fails, then write `pollGate.ts`**

```ts
import type { AppStateStatus } from "react-native";

export function shouldPoll(input: {
  hasActiveGeneration: boolean;
  localStreamActive: boolean;
  appState: AppStateStatus;
}): boolean {
  return input.hasActiveGeneration && !input.localStreamActive && input.appState === "active";
}
```

- [ ] **Step 7: Run all three test files to verify they pass**

Run: `bun test src/features/chat/hooks/streamPhase.test.ts src/features/chat/hooks/transcriptCacheLogic.test.ts src/features/chat/hooks/pollGate.test.ts`
Expected: PASS (all cases, all three files)

- [ ] **Step 8: Gates and commit**

```bash
bunx tsc --noEmit && bun run lint
bun test src/features/chat/hooks/streamPhase.test.ts src/features/chat/hooks/transcriptCacheLogic.test.ts src/features/chat/hooks/pollGate.test.ts
git add src/features/chat/hooks/streamPhase.ts src/features/chat/hooks/streamPhase.test.ts \
        src/features/chat/hooks/transcriptCacheLogic.ts src/features/chat/hooks/transcriptCacheLogic.test.ts \
        src/features/chat/hooks/pollGate.ts src/features/chat/hooks/pollGate.test.ts
git commit -m "feat: add pure stream-phase, transcript-cache, and poll-gate logic"
```

---

## Task 6: Chat config constants + seed-question parsing

**Files:**
- Create: `src/features/chat/lib/config.ts`
- Create: `src/features/chat/lib/seedQuestion.ts`
- Test: `src/features/chat/lib/seedQuestion.test.ts`

**Interfaces:**
- Produces: `SUGGESTED_PROMPTS: string[]`, `COMPOSER_NOTICE: string`, `CHAT_PRIVACY_NOTICE: {...}`, `MESSAGE_MAX_LENGTH: number`, `AI_IDENTITY_BADGE: string` (from `config.ts`); `parseSeedQuestion(raw: string | undefined): string | null` (from `seedQuestion.ts`). Task 8's `WelcomeState`/`Composer` import `config.ts`'s constants; Task 10's screen wiring imports `parseSeedQuestion`.

- [ ] **Step 1: Copy the exact copy strings from `docs/04-content-inventory.md` §8.10–8.11 into `config.ts`**

Read `docs/04-content-inventory.md` §8.10–8.11 directly and transcribe verbatim — do not paraphrase or invent copy. Shape:

```ts
export const SUGGESTED_PROMPTS: string[] = [
  // exact 8 strings from docs/04-content-inventory.md §8.10
];

export const COMPOSER_NOTICE =
  "AI can make mistakes. For commitments or private details, contact Mohamed directly.";

export const CHAT_PRIVACY_NOTICE = {
  // exact title/intro/detail bullets/moreLink from docs/04-content-inventory.md §8.11
};

export const MESSAGE_MAX_LENGTH = 4000;
export const AI_IDENTITY_BADGE = "AI representative";
```

- [ ] **Step 2: Write the failing test for `parseSeedQuestion`**

```ts
// src/features/chat/lib/seedQuestion.test.ts
import { describe, expect, test } from "bun:test";
import { parseSeedQuestion } from "./seedQuestion";

describe("parseSeedQuestion", () => {
  test("returns null for undefined", () => {
    expect(parseSeedQuestion(undefined)).toBeNull();
  });
  test("returns null for an empty string", () => {
    expect(parseSeedQuestion("")).toBeNull();
  });
  test("returns the trimmed, NFC-normalized string for valid input", () => {
    expect(parseSeedQuestion("  What does Mohamed specialize in?  ")).toBe("What does Mohamed specialize in?");
  });
  test("returns null for input over MESSAGE_MAX_LENGTH", () => {
    expect(parseSeedQuestion("a".repeat(4001))).toBeNull();
  });
  test("accepts input at exactly MESSAGE_MAX_LENGTH", () => {
    expect(parseSeedQuestion("a".repeat(4000))).toBe("a".repeat(4000));
  });
});
```

- [ ] **Step 3: Run to verify it fails, then write `seedQuestion.ts`**

```ts
import { MESSAGE_MAX_LENGTH } from "./config";

export function parseSeedQuestion(raw: string | undefined): string | null {
  if (!raw) return null;
  const normalized = raw.normalize("NFC").trim();
  if (normalized.length < 1 || normalized.length > MESSAGE_MAX_LENGTH) return null;
  return normalized;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `bun test src/features/chat/lib/seedQuestion.test.ts`
Expected: PASS (all cases)

- [ ] **Step 5: Gates and commit**

```bash
bunx tsc --noEmit && bun run lint && bun test src/features/chat/lib/seedQuestion.test.ts
git add src/features/chat/lib/config.ts src/features/chat/lib/seedQuestion.ts src/features/chat/lib/seedQuestion.test.ts
git commit -m "feat: add chat config constants and seed-question parsing"
```

---

## Task 7: RN-runtime hooks — transcript cache, boot, polling, chat-session composition

**Files:**
- Create: `src/features/chat/hooks/useTranscriptCache.ts`
- Create: `src/features/chat/hooks/useConversationBoot.ts`
- Create: `src/features/chat/hooks/usePollingRefresh.ts`
- Create: `src/features/chat/hooks/useChatSession.ts`

**Interfaces:**
- Consumes: `validateCache`/`evictOverflow` (Task 5), `shouldPoll` (Task 5), `deriveStreamPhase` (Task 5), `fetchLatestConversation`/`createConversation`/`fetchConversation`/`cancelConversation`/`deleteConversation` (Task 2), `createChatTransport` (Task 2), `parseChatError` (Task 3), `chatBlocksFromParts`/`parseToolStatusPart` (Task 4).
- Produces: `useTranscriptCache()` → `{ cached: CachedTranscript | null, save: (t: CachedTranscript) => void }`; `useConversationBoot()` → `{ phase: "loading"|"ready"|"degraded"|"failed", snapshot, cached, retry: () => void }`; `usePollingRefresh(args)` (void, side-effect only); `useChatSession()` → `{ messages, blocks, phase, error, sendMessage, stop, retry, newChat, bootState }`. Task 8's `ChatShell` calls only `useChatSession()`.

This task is RN-runtime glue (AsyncStorage, secure-store already wrapped by Task 1, `AppState`, `useChat`) over the pure logic already tested in Task 5 — it is verified primarily on-device (Task 10), not via `bun test`, per the spec's testing section.

- [ ] **Step 1: Install the new dependency this task needs**

```bash
bun add @react-native-async-storage/async-storage
```

- [ ] **Step 2: Write `useTranscriptCache.ts`**

Behavior: read the single AsyncStorage key `"mg_chat_transcript"` on mount (JSON-parse, `CachedTranscript | null` on parse failure), expose a `save(transcript)` function that runs `evictOverflow` on `transcript.messages` before `JSON.stringify`-ing and writing, debounced 250ms (e.g. via a `setTimeout` ref reset on each call, matching the spec's "debounce-saved (250ms)").

- [ ] **Step 3: Write `useConversationBoot.ts`**

Behavior per spec §Feature layer: on mount, read `useTranscriptCache().cached`; call `fetchLatestConversation()`, and if it returns `null`, call `createConversation()`; call `validateCache(cached, snapshot)` — if valid, hydrate from `cached.messages`, else hydrate from `snapshot.messages` and `save()` a fresh cache entry built from the snapshot. On a thrown/network error from either fetch call: if `cached` exists, expose `{ phase: "degraded", cached }`; else `{ phase: "failed" }`. Expose a `retry()` that re-runs the same sequence (used by the "Boot failed" retry panel).

- [ ] **Step 4: Write `usePollingRefresh.ts`**

Behavior: subscribe to `AppState.addEventListener("change", ...)`; on every state change and on `hasActiveGeneration`/`localStreamActive` change, recompute `shouldPoll(...)` (Task 5) and start/clear a `1500`ms `setInterval` accordingly; on each tick call `fetchConversation(conversationId)` and pass the result to the caller's `onRefresh` callback. Clean up the listener and any live interval on unmount.

- [ ] **Step 5: Write `useChatSession.ts`**

Compose: `useConversationBoot()` for the initial snapshot/conversation id; `useChat<ChatUIMessage>({ id: conversationId, transport: createChatTransport({ conversationId, onResponse }), throttle: 50, onData: (part) => { const status = parseToolStatusPart(part); if (status) setActiveToolLabel(status.activeLabel); }, onError: (error) => setLastError(parseChatError(error)) })`; `usePollingRefresh({ conversationId, hasActiveGeneration, localStreamActive: status === "submitted" || status === "streaming", onRefresh: hydrateFromSnapshot })`; `deriveStreamPhase({...})` for the exposed `phase`.

- `stop()`: call `useChat`'s `stop()`, then **always** `await cancelConversation(conversationId)` regardless of whether the abort succeeded (wrap in try/catch, swallow failure — the abort is still the primary signal to the UI).
- `retry()`: find the trailing assistant message id and call `regenerate({ messageId })` (drives the transport's `regenerate-message` branch from Task 2).
- `newChat()`: `try { await deleteConversation(currentId) } catch {}`, then `await createConversation()`, reset local `messages`/cache/`activeToolLabel`/`lastError`.
- On `parseChatError` returning `MESSAGE_BLOCKED` or `SECRET_IN_MESSAGE`: remove the optimistic trailing user message from `messages` and restore its text into a `draftText` field the `Composer` reads from (port of `discardRejectedTurn`).

- [ ] **Step 6: Gates and commit**

```bash
bunx tsc --noEmit && bun run lint
git add package.json bun.lock src/features/chat/hooks/useTranscriptCache.ts \
        src/features/chat/hooks/useConversationBoot.ts src/features/chat/hooks/usePollingRefresh.ts \
        src/features/chat/hooks/useChatSession.ts
git commit -m "feat: add chat session composition hooks (boot, polling, transcript cache)"
```

Manual check before moving on: log `bootState`/`phase` transitions in a throwaway console.log while running the app against a real backend, confirm boot → ready happens, then remove the throwaway logging before commit.

---

## Task 8: Chat shell, message list, composer, status, error UI

**Files:**
- Create: `src/features/chat/components/ChatShell.tsx`
- Create: `src/features/chat/components/MessageList.tsx`
- Create: `src/features/chat/components/MessageItem.tsx`
- Create: `src/features/chat/components/Composer.tsx`
- Create: `src/features/chat/components/WelcomeState.tsx`
- Create: `src/features/chat/components/StreamStatus.tsx`
- Create: `src/features/chat/components/ErrorNotice.tsx`
- Create: `src/features/chat/components/LiveAnnouncer.tsx`

**Interfaces:**
- Consumes: `useChatSession()` (Task 7), `StreamPhase` (Task 5), `chatBlocksFromParts` (Task 4), `SUGGESTED_PROMPTS`/`COMPOSER_NOTICE`/`MESSAGE_MAX_LENGTH` (Task 6), `Button`/`Screen`/theme tokens (`src/components/ui/`, `src/theme/`), `lightImpact`/`selectionChanged` (`src/lib/haptics.ts`).
- Produces: `<ChatShell />` — the only export `(chat)/index.tsx` (Task 10) renders.

Follow existing repo conventions throughout (`StyleSheet.create` at module scope only, theme tokens for all colors/spacing/typography, radius `0`, `Ionicons` for any icon, haptics via `src/lib/haptics.ts`). Reference `src/features/home/**` and `src/components/ui/*` for the established prop/style patterns in this codebase before writing new components.

- [ ] **Step 1: `ChatShell.tsx`** — calls `useChatSession()`; renders `WelcomeState` when `messages.length === 0` and `phase !== "submitted"/"connecting"`, otherwise `MessageList`; renders `ErrorNotice` when `error` is set; renders `Composer` pinned to the bottom with a `KeyboardAvoidingView`; renders `LiveAnnouncer` (non-visual). Not wrapped in `Screen` — owns its own root `View`/`SafeAreaView` since `Screen`'s always-ScrollView-first-child contract doesn't fit a chat layout (per spec).

- [ ] **Step 2: `MessageList.tsx` / `MessageItem.tsx`** — `FlatList` keyed by message `id`, `inverted` or bottom-anchored per the repo's existing scroll conventions; `MessageItem` renders text parts as plain styled `Text` (reuse whatever markdown-lite rendering convention exists elsewhere in the repo, or plain text if none exists yet — do not add a new markdown dependency for this phase) and blocks via `chatBlocksFromParts(message.parts)`, dispatching each recognized block to the Task 9 renderer components by `block.type`, and unrecognized ones to `UnknownBlock`.

- [ ] **Step 3: `Composer.tsx`** — controlled `TextInput` bound to `draftText`/`sendMessage`, enforcing `MESSAGE_MAX_LENGTH`; a send `Button` with `icon: { name: "arrow-up-circle", position: "trailing" }` (or `"stop-circle"` + `stop()` while streaming — swap based on `phase`), disabled while `phase` is `"submitted"`/`"connecting"` and the field is empty; renders `COMPOSER_NOTICE` beneath the field in `Typography.small`/`textMuted`.

- [ ] **Step 4: `WelcomeState.tsx`** — intro copy + the first 6 of `SUGGESTED_PROMPTS` rendered as `PromptChip`s (`src/components/ui/prompt-chip.tsx` if it exists per the design-system primitives list — reuse it); tapping a chip seeds the composer and calls `selectionChanged()`.

- [ ] **Step 5: `StreamStatus.tsx`** — small inline row above the composer or trailing the last message, mapping `StreamPhase` → a short label (`"retrieving"` shows `activeToolLabel`, `"streaming"`/`"connecting"`/`"submitted"` show a lightweight activity indicator, `"stopped"` shows "Stopped").

- [ ] **Step 6: `ErrorNotice.tsx`** — renders `error.message` (the local-table copy from Task 3, never a raw server string) with a `Button` labeled "Retry" (`variant: "ghost"`) shown only when `error.retryable`, calling `useChatSession().retry()`.

- [ ] **Step 7: `LiveAnnouncer.tsx`** — a non-rendering (or visually hidden) component that calls `AccessibilityInfo.announceForAccessibility(...)` when `phase` or `error` changes, so a screen-reader user hears "Mo Ghaly GPT is typing" / "Reply complete" / error copy without needing to inspect the screen.

- [ ] **Step 8: Gates and commit**

```bash
bunx tsc --noEmit && bun run lint
git add src/features/chat/components/ChatShell.tsx src/features/chat/components/MessageList.tsx \
        src/features/chat/components/MessageItem.tsx src/features/chat/components/Composer.tsx \
        src/features/chat/components/WelcomeState.tsx src/features/chat/components/StreamStatus.tsx \
        src/features/chat/components/ErrorNotice.tsx src/features/chat/components/LiveAnnouncer.tsx
git commit -m "feat: add chat shell, message list, composer, and status UI"
```

---

## Task 9: Block renderer components + header actions

**Files:**
- Create: `src/features/chat/components/blocks/ProjectGrid.tsx`
- Create: `src/features/chat/components/blocks/SourceList.tsx`
- Create: `src/features/chat/components/blocks/LeadFormPlaceholder.tsx`
- Create: `src/features/chat/components/blocks/ContactHandoffPlaceholder.tsx`
- Create: `src/features/chat/components/blocks/UnknownBlock.tsx`
- Create: `src/features/chat/components/ChatHeaderActions.tsx`

**Interfaces:**
- Consumes: `ProjectGridBlock`/`SourceListBlock`/`LeadFormBlock`/`ContactHandoffBlock` (Task 4), `getProjectBySlug` (`src/data/projects.ts`), `CONTACT_EMAIL`/`CONTACT_PHONE`/`CONTACT_WHATSAPP`/`CONTACT_MAILTO`/`CONTACT_TEL` (`src/data/contact.ts`), `useChatSession().newChat` (Task 7).
- Produces: one component per block `type`, dispatched from Task 8's `MessageItem`; `<ChatHeaderActions />` consumed by Task 10's screen wiring.

- [ ] **Step 1: `ProjectGrid.tsx`** — `block.slugs.map(getProjectBySlug).filter(Boolean)`; if the resulting list is empty, render `null` (never an empty/broken section — matches the web's fallback behavior); otherwise render each resolved project as an existing `ProjectCard`-style row (reuse `src/components/project-card.tsx` if its props fit; adapt if not) with the chevron-forward affordance convention, pushing to the Home-stack project detail route on tap (`selectionChanged()` on press, per `01-design-system.md` §11).

- [ ] **Step 2: `SourceList.tsx`** — same slug-resolution logic as `ProjectGrid`, rendered as a compact list of title + external-link icon rows instead of full cards (mirrors the web's distinction between a "these are the relevant projects" grid vs. a "here's where I found this" citation list).

- [ ] **Step 3: `LeadFormPlaceholder.tsx`** — non-interactive: render the model-authored `draft.summary` (or a generic "Mohamed will need a few more details" line if `summary` is null) as plain read-only text in a bordered card (hairline `border`, no radius); no submit action, no text inputs. Label clearly, e.g. a small "Coming soon" `Badge` (`src/components/ui/badge.tsx`), so it doesn't look broken.

- [ ] **Step 4: `ContactHandoffPlaceholder.tsx`** — render `CONTACT_EMAIL`/`CONTACT_PHONE`/a WhatsApp label from `src/data/contact.ts` as plain, non-tappable text (no `Linking.openURL`, no `tel:`/`mailto:` links — those become interactive in M6). Same "Coming soon" `Badge` treatment as the lead-form placeholder for visual consistency.

- [ ] **Step 5: `UnknownBlock.tsx`** — minimal fallback: a bordered card with a small muted "This part of the reply couldn't be displayed" line. Must never throw regardless of what malformed data reached it (it only ever receives the `{ kind: "unknown" }` case, which carries no payload to render).

- [ ] **Step 6: `ChatHeaderActions.tsx`** — two `Ionicons`-only icon buttons (no `Button` component here — these are header-bar icon buttons, not content buttons; match the icon-button pattern already used for any other header actions in the repo, or a plain `Pressable` + `Ionicons` + `lightImpact()` on press if no existing pattern applies): "New chat" (icon e.g. `"add-circle-outline"`, calls `useChatSession().newChat()`), "Privacy & help" (icon e.g. `"information-circle-outline"`, calls `router.push("/(tabs)/(home)/privacy")`).

- [ ] **Step 7: Gates and commit**

```bash
bunx tsc --noEmit && bun run lint
git add src/features/chat/components/blocks/ src/features/chat/components/ChatHeaderActions.tsx
git commit -m "feat: add chat block renderers and header actions"
```

---

## Task 10: Screen wiring + device verification

**Files:**
- Modify: `src/app/(tabs)/(chat)/index.tsx`
- Modify: `src/app/(tabs)/(chat)/_layout.tsx`

**Interfaces:**
- Consumes: `<ChatShell />` (Task 8), `<ChatHeaderActions />` (Task 9), `parseSeedQuestion` (Task 6).

- [ ] **Step 1: Update `index.tsx`**

Replace the `PlaceholderScreen` body with `<ChatShell />`. In the same component, read the `q` param (`useLocalSearchParams<{ q?: string }>()`), and on mount, if `parseSeedQuestion(params.q)` returns non-null, call `useChatSession().sendMessage(...)` once and then clear the param via `router.setParams({ q: undefined })` so relaunch doesn't double-send. Install `navigation.setOptions({ headerRight: () => <ChatHeaderActions /> })` via `useLayoutEffect`.

- [ ] **Step 2: Update `_layout.tsx`**

Change only the `(chat)` root screen's title string to `"Mo Ghaly GPT"` (per `docs/04-content-inventory.md` §8.10) — the large-title/blur/tint header-options logic itself is unchanged (already correct from M0's scaffolding, matches every other tab).

- [ ] **Step 3: Gates**

```bash
bunx tsc --noEmit && bun run lint && bun test
```

All must be green (this also re-runs every test file from Tasks 1–6).

- [ ] **Step 4: Device verification (manual — this is the phase's actual Exit criterion)**

On a physical device, run through and confirm each of:
- Send → stream → stop → retry → background the app → relaunch: transcript intact.
- Trigger `RATE_LIMITED` (send several messages quickly), a blocked message (e.g. an obvious off-topic/policy-violating prompt), and airplane-mode a request mid-send (`NETWORK`) — confirm each renders its exact local copy from Task 3's table, never server text.
- Both iOS and Android.
- Both color schemes.
- With reduced motion enabled (if any entrance animation is added to message rows — if none was added, this check is a no-op, but confirm that explicitly rather than skipping it).

- [ ] **Step 5: Commit**

```bash
git add src/app/(tabs)/(chat)/index.tsx src/app/(tabs)/(chat)/_layout.tsx
git commit -m "feat: wire Chat tab to the native streaming session (M5)"
```

- [ ] **Step 6: Update phase status**

Update the "Status" line in this repo's `CLAUDE.md` to record M5 as landed (matching how M0–M4's completion is already recorded there), and update `docs/00-roadmap.md` if it tracks phase status inline. This closes out the phase per the repo's Definition of Done ("If the change drifts from a document in `docs/`, update the document in the same change" — here nothing drifted, but the roadmap's phase-tracking line needs the same landed-status update M4 got).

---

## Self-review

**Spec coverage:** Data layer (Task 1–3) ✓, block parsers (Task 4) ✓, pure logic incl. new `AppState` gating (Task 5) ✓, config/seed-question (Task 6) ✓, RN-runtime hooks incl. offline cache (Task 7) ✓, all UI components incl. placeholders (Task 8–9) ✓, screen wiring + header actions (Task 10) ✓, error handling (woven through Tasks 3/7/8) ✓, testing strategy split pure-vs-device (woven through every task) ✓, exit criterion (Task 10 Step 4) ✓.

**Placeholder scan:** No TBD/TODO in any step; every code step has real code; Task 6 Step 1 explicitly instructs transcribing verbatim from the content-inventory doc rather than inventing copy (the one place actual prose isn't inlined here, since it must come from the source-of-truth doc, not be guessed).

**Type consistency:** `ConversationSnapshot`/`ConversationSnapshotMessage`/`ConversationSnapshotPart` defined once in Task 2, imported everywhere else. `ChatUIBlock`/`ProjectGridBlock`/etc. defined once in Task 4. `StreamPhase` defined once in Task 5, consumed by Tasks 7–8. `CachedTranscript` defined once in Task 5 (`transcriptCacheLogic.ts`), reused by Task 7's `useTranscriptCache`/`useConversationBoot`. `apiRequest` (Task 1) is the sole HTTP entry point every other data-layer function (Task 2) builds on — no task calls `fetch`/`expo/fetch` directly outside Tasks 1 and 2's transport.
