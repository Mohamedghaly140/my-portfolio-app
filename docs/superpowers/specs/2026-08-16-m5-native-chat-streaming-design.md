# M5 — Chat tab, native streaming — design

Status: approved for implementation. Author: Claude (brainstorming session with Mohamed Ghaly), 2026-08-16.

## Problem

M0–M4 are done. `(chat)/index.tsx` is still an M0 placeholder (`PlaceholderScreen`), and nothing in this repo talks to the chat backend yet: no `src/lib/api/`, no `src/lib/session/`, no `src/features/chat/`. M4 (committed in the web repo, `0cd13ab`) opened the channel a native client needs — `assertTrustedCaller` accepts `x-mg-client` + `x-mg-session` headers as an alternative to a same-origin cookie, and `resolveAnonymousSession` accepts `x-mg-session` as a cookie fallback, echoing a reissued session back the same way. M5 is the client side of that channel: a fully native, streaming Mo Ghaly GPT chat experience, built entirely in this repo.

The web app (`~/projects/my-portfolio`, `features/chat/**` + `lib/chat/**`) already has a working, tested version of this same protocol. M5 is substantially a **port**, not a fresh design: same wire protocol, same block/error semantics, same restore/poll/stop/retry shape — adapted to React Native's fetch/streaming constraints (D5) and to two things native needs that the browser doesn't (`AppState`-gated polling, `expo-secure-store` instead of an `HttpOnly` cookie).

## Scope decisions (from brainstorming)

- **Chat header** — keep the native large-title/blur convention every other root tab uses (`docs/01-design-system.md` §10). Add "New chat" and "Privacy & help" as `headerRight` icon buttons via `navigation.setOptions`, not a custom header component.
- **Block scope** — `project_grid` and `source_list` ship fully interactive, resolved against bundled `src/data/projects.ts` (D7). `lead_form` and `contact_handoff` render as non-interactive placeholders in M5; the roadmap's file list assigns their real (submitting) UI to M6 ("Lead capture + Contact tab"), which is the phase that also adds `src/lib/api/leads.ts` and `src/lib/api/contact.ts`.
- **Offline cache** — build a local transcript cache now (AsyncStorage, one versioned JSON envelope, ported from the web's `sessionStorage` design), enabling the "Degraded (cache only)" state from `docs/02-screens.md` §5.1's states table. The web has no `AppState` gating on its poll loop (confirmed by reading `features/chat/components/ChatSession.tsx` — plain `setInterval`, no visibility handling); that gating is new work for M5, not a port.
- **No conversation switcher / history browser.** `GET /api/conversations` always returns the single newest active conversation. "New chat" is best-effort `DELETE` of the current conversation (ignore failure/409) + `POST` a fresh one — there's no archive/list UI in scope.
- **No new dependencies beyond what's already installed.** `expo-secure-store`, `ai`, `@ai-sdk/react`, `zod`, `@tanstack/react-query` are all already in `package.json`. `expo/fetch` ships with the Expo SDK. AsyncStorage (`@react-native-async-storage/async-storage`) is the one new dependency this phase needs — it's the standard Expo-compatible key/value store and is not yet installed.

## 1. Data layer

### `src/lib/session/chatSession.ts`

Thin wrapper over `expo-secure-store`:
```ts
export async function getStoredSession(): Promise<string | null>
export async function setStoredSession(value: string): Promise<void>
export async function clearStoredSession(): Promise<void>
```
Key: a single fixed Secure Store key (e.g. `"mg_chat_session"`, matching the web cookie's name for clarity — no functional requirement that it match).

### `src/lib/api/client.ts`

The single authenticated client CLAUDE.md requires ("every request goes through the single client in `src/lib/api/`... do not call `fetch` directly from a screen"). Wraps `expo/fetch` (used uniformly for both streaming and non-streaming calls — one fetch implementation, not two):

- Injects `Origin: <EXPO_PUBLIC_API_ORIGIN>`, `x-mg-client: mobile/1.0`, `x-mg-session: <stored value>` (when present) on every request.
- On response, if an `x-mg-session` response header is present, persists it via `setStoredSession`.
- Exposes a small `request(path, init)` helper that the modules below build on; not a full REST-client abstraction — YAGNI.

### `src/lib/api/conversations.ts`

```ts
export async function fetchLatestConversation(): Promise<ConversationSnapshot | null>   // GET /api/conversations
export async function createConversation(): Promise<ConversationSnapshot>               // POST /api/conversations
export async function fetchConversation(id: string): Promise<ConversationSnapshot>       // GET /api/conversations/:id
export async function cancelConversation(id: string): Promise<void>                      // POST /api/conversations/:id/cancel
export async function deleteConversation(id: string): Promise<void>                      // DELETE /api/conversations/:id
```

`ConversationSnapshot` type (mirrors `lib/chat/conversationSnapshot.ts` in the web repo exactly):
```ts
type ConversationMessageStatus = "PENDING" | "STREAMING" | "COMPLETED" | "FAILED" | "CANCELLED" | "BLOCKED";

type ConversationSnapshotPart =
  | { type: "text"; text: string }
  | { type: "data-projectGrid"; data: ProjectGridBlock }
  | { type: "data-sourceList"; data: SourceListBlock }
  | { type: "data-leadForm"; data: LeadFormBlock }
  | { type: "data-contactHandoff"; data: ContactHandoffBlock };

type ConversationSnapshotMessage = {
  id: string; role: "user" | "assistant"; status: ConversationMessageStatus;
  parts: ConversationSnapshotPart[]; createdAt: string; completedAt: string | null;
};

type ConversationSnapshot = {
  id: string; version: string; status: "ACTIVE";
  messages: ConversationSnapshotMessage[]; hasActiveGeneration: boolean;
  createdAt: string; updatedAt: string;
};
```
`version` is `updatedAt` as an ISO string — a cache-validity token only, not compared as a date.

### `src/lib/api/chatTransport.ts`

Port of the web's `features/chat/lib/chatTransport.ts`:
```ts
export function createChatTransport(args: {
  conversationId: string;
  onResponse: (response: Response) => void; // fires once headers arrive, drives "connected" state
}): DefaultChatTransport<ChatUIMessage>
```
Config: `fetch: expoFetch` (not global `fetch` — D5, RN's default `fetch` returns `response.body === null` so the AI SDK stream can't be read), `api: "${EXPO_PUBLIC_API_ORIGIN}/api/chat"`. `prepareSendMessagesRequest` branches on `trigger`:
- `"regenerate-message"` → `{ api: "${origin}/api/messages/${messageId}/retry", body: { clientRetryId: uuid(), locale: "en" } }`
- otherwise → `{ body: { conversationId, message: <latest user text>, clientMessageId: uuid(), locale: "en" } }` — **only the newest user turn is sent**; history lives server-side in Postgres (port of `prepareChatBody`).

`useChat` is wired with `throttle: 50` (matches the web) and `generateId: uuid`.

### `src/lib/api/errors.ts`

Ported verbatim from `lib/chat/errors.ts` (web repo) — full 12-code table:

| Code | Retryable | Copy |
|---|---|---|
| `VALIDATION` | false | Check the message and try again. |
| `NOT_FOUND` | false | This conversation is no longer available. |
| `LEAD_DRAFT_EXPIRED` | false | This contact form has expired. Review it and try again. |
| `IDEMPOTENCY_CONFLICT` | false | That message identifier was already used. Send the message again. |
| `RETRY_REQUIRED` | true | That reply ended early. Use Retry to continue this conversation. |
| `RATE_LIMITED` | true | You've sent several messages quickly. Try again shortly. |
| `MESSAGE_BLOCKED` | false | I can't help with that request. Try asking about Mohamed's professional work. |
| `SECRET_IN_MESSAGE` | false | That message looks like it contains a credential or API key. Remove it and try again. |
| `BUSY` | true | A reply is still being written. Wait for it to finish or stop it first. |
| `UPSTREAM_TIMEOUT` | true | The reply took too long. Please retry. |
| `AI_UNAVAILABLE` | true | Mo Ghaly GPT is temporarily unavailable. |
| `CONTEXT_UNAVAILABLE` | true | This conversation is still preparing its context. Please retry shortly. |
| `INTERNAL` | true | Something went wrong. Your message was not lost; please retry. |

Plus a client-only addition (not from the server table): `NETWORK` — retryable, "Check your connection and try again."

```ts
export function parseChatError(error: unknown): { code: string; message: string; retryable: boolean }
```
Port of `parseChatError.ts`: JSON body `{ error: { code }, requestId }` → look up table; bare string equal to a known code → look up table; `TypeError` matching `/fetch|network/i` → `NETWORK`; anything else → `INTERNAL`. **Never render the server's `message` field or a raw thrown error's message** — always the local table's copy.

## 2. Feature layer (`src/features/chat/`)

### `blocks/`

Port of `lib/chat/blocks/index.ts`, using `zod` (already a dependency) to mirror the schemas 1:1:

```ts
export const CHAT_BLOCK_DATA_PART_NAME = {
  project_grid: "data-projectGrid", source_list: "data-sourceList",
  lead_form: "data-leadForm", contact_handoff: "data-contactHandoff",
} as const;

// slugs: array of 1-6 unique strings matching /^[a-z0-9-]{1,64}$/, each resolvable via getProjectBySlug
export type ProjectGridBlock = { type: "project_grid"; version: 1; slugs: string[] };
export type SourceListBlock  = { type: "source_list";  version: 1; slugs: string[] };
export type LeadFormBlock = {
  type: "lead_form"; version: 1;
  draft: {
    opportunityType: string | null; summary: string | null; technologies: string[];
    timeline: string | null; projectStage: string | null; primaryTechnicalProblem: string | null;
  };
};
export type ContactHandoffBlock = {
  type: "contact_handoff"; version: 1;
  status: "ready" | "submitted" | "failed"; leadReference?: string;
};
export type ToolStatus = { version: 1; activeLabel: string | null };

export function parseChatDataPart(part: unknown): { kind: "block"; block: ChatUIBlock } | { kind: "unknown" } | null
export function parseToolStatusPart(part: unknown): ToolStatus | null
export function chatBlocksFromParts(parts: readonly unknown[]): RenderableChatBlock[]
export function chatBlockFingerprint(parts: readonly unknown[]): string // memoization key only, not a content hash
```

Correctness requirements carried over from the web implementation:
- Data-part-name → schema lookup must use `Object.hasOwn(map, part.type)`, not `in` or direct indexing — `part.type` is untrusted wire data and a plain lookup risks resolving to `Object.prototype` members (e.g. `"constructor"`).
- Malformed/unknown data parts become `{ kind: "unknown" }` and render `UnknownBlock` — **never throw**, since a bad part must not crash the message list.
- `data-toolStatus` is not a persistent block — it's excluded from `chatBlocksFromParts`/`parseChatDataPart`'s block union and consumed only via `parseToolStatusPart`, feeding the transient "retrieving…" indicator.

### `hooks/useConversationBoot.ts`

```ts
type BootState =
  | { phase: "loading" }
  | { phase: "ready"; snapshot: ConversationSnapshot; degraded: false }
  | { phase: "degraded"; cached: CachedTranscript; degraded: true }
  | { phase: "failed" }; // no network, no cache
```
Sequence: read cache (`useTranscriptCache`) → `fetchLatestConversation()` → if `null`, `createConversation()` → validate cache against the snapshot (`id` + `version` match; port of `selectValidatedCache`) → `ready`. On network failure: cache present → `degraded`; no cache → `failed` (drives the "Boot failed (no cache)" retry-panel state from `docs/02-screens.md`).

### `hooks/useTranscriptCache.ts`

AsyncStorage, one key (`"mg_chat_transcript"`), one versioned envelope (port of the web's `features/chat/lib/transcript.ts`):
```ts
type CachedTranscript = {
  version: number; // bump on shape changes, mismatched version = discard
  conversationId: string;
  snapshotVersion: string; // the ConversationSnapshot.version this cache reflects
  messages: ConversationSnapshotMessage[];
  stoppedIds: string[];
};
```
Cap: 40 messages, oldest-first eviction, ~200KB serialized size cap (matches the web's `MAX_TRANSCRIPT_MESSAGES` / `MAX_TRANSCRIPT_BYTES`). Writes are debounced (250ms) off message-list changes.

### `hooks/usePollingRefresh.ts`

**New logic — not a port.** The web has no visibility gating (confirmed: no `visibilitychange`/`document.hidden` anywhere in `features/chat`); native must not burn battery/data polling in the background.
```ts
export function usePollingRefresh(args: {
  conversationId: string;
  hasActiveGeneration: boolean;
  localStreamActive: boolean; // status === "submitted" | "streaming"
  onRefresh: () => void;
}): void
```
Runs a 1500ms interval **only when** `hasActiveGeneration && !localStreamActive`, wrapped in an `AppState` listener that starts the interval on `active` and clears it on `background`/`inactive`. On each tick, calls `fetchConversation(id)` and feeds the result back through the same snapshot-hydration path boot uses (replace messages, update `hasActiveGeneration`, clear/set durable error from terminal assistant status).

### `hooks/useStreamPhase.ts`

Pure port of `deriveStreamPhase`:
```ts
export type StreamPhase = "submitted" | "connecting" | "retrieving" | "streaming" | "completed" | "stopped" | "failed";

export function deriveStreamPhase(input: {
  status: "submitted" | "streaming" | "ready" | "error";
  connected: boolean; activeToolLabel: string | null; lastTurnStopped: boolean; hasError: boolean;
}): StreamPhase
```
`connected` flips true on the transport's `onResponse` callback (headers arrived), independent of `useChat`'s own `status`.

### `hooks/useChatSession.ts`

Composition root — the only hook `ChatShell` calls directly. Owns:
- `useChat` (transport from `createChatTransport`, `throttle: 50`, `onData` → `parseToolStatusPart`, `onError` → `parseChatError`)
- boot (`useConversationBoot`), cache (`useTranscriptCache`), polling (`usePollingRefresh`), phase (`useStreamPhase`)
- `stop()` — aborts the local stream **and always** calls `cancelConversation(id)` regardless of abort success (RN abort propagation to the server is unreliable — this is explicit in `docs/03-api-contract.md` §f, not optional).
- `retry()` — targets `POST /api/messages/{assistantMessageId}/retry` via the transport's `regenerate-message` trigger.
- `newChat()` — best-effort `deleteConversation(current)` (ignore failure/409-busy) → `createConversation()` → reset cache and local state.
- Rejected-turn cleanup: on `MESSAGE_BLOCKED`/`SECRET_IN_MESSAGE`, strips the optimistic user message from local state and restores its text to the composer draft (port of `discardRejectedTurn`) so nothing typed is silently lost.

Exposes: `{ messages, blocks, phase, error, sendMessage, stop, retry, newChat, bootState }`.

### `components/`

- **`ChatShell.tsx`** — top-level composition; calls `useChatSession`; installs `navigation.setOptions({ headerRight })` for "New chat" / "Privacy & help"; renders `WelcomeState` (empty conversation) or `MessageList`, plus `ErrorNotice` and `Composer`.
- **`MessageList.tsx` / `MessageItem.tsx`** — `FlatList`, not `Screen`'s `ScrollView` (chat needs its own scroll position control + keyboard-avoiding behavior that `Screen`'s always-first-child `ScrollView` doesn't support). Renders text parts as markdown-lite (existing text rendering conventions from other screens) and blocks via `chatBlocksFromParts`.
- **`Composer.tsx`** — text field (`MESSAGE_MAX_LENGTH = 4000`, ported from `lib/chat/config.ts`), send/stop as `Button` with `icon` (not an embedded arrow — `01-design-system.md` §11), composer notice string (`COMPOSER_NOTICE`, ported verbatim).
- **`WelcomeState.tsx`** — intro copy + 6 of the 8 `SUGGESTED_PROMPTS` (ported verbatim from `docs/04-content-inventory.md` §8.10–8.11 / `lib/chat/config.ts`), each a `PromptChip` that seeds the composer.
- **`StreamStatus.tsx`** — renders the `StreamPhase` (e.g. "retrieving" shows `activeToolLabel`).
- **`ErrorNotice.tsx`** — local copy only, `Retry` button when `retryable`.
- **`LiveAnnouncer.tsx`** — accessibility live-region equivalent (`AccessibilityInfo.announceForAccessibility` on phase/error changes) for screen-reader users tracking stream progress.
- **`blocks/ProjectGrid.tsx`, `blocks/SourceList.tsx`** — resolve `slugs` via `getProjectBySlug` (`src/data/projects.ts`); unresolvable slugs are dropped; an all-unresolved block renders nothing (port of the web's `projectCardBySlug` fallback behavior — never render a broken/empty section).
- **`blocks/LeadFormPlaceholder.tsx`, `blocks/ContactHandoffPlaceholder.tsx`** — non-interactive: `LeadFormPlaceholder` shows the model-authored draft summary as read-only text ("Mohamed will need a few more details — this will be available soon"); `ContactHandoffPlaceholder` shows the resolved contact channels from `src/data/contact.ts` (D7 — email/phone/WhatsApp constants, never wire-supplied) as plain, non-tappable-for-submission text. Both get replaced by real, submitting UI in M6.
- **`blocks/UnknownBlock.tsx`** — generic fallback for `{ kind: "unknown" }`.

## 3. Screen wiring

`(chat)/_layout.tsx` — unchanged header-chrome pattern (iOS `headerLargeTitle`/transparent/blur, Android flat `colors.bg`), only the static title string changes to "Mo Ghaly GPT" (`docs/04-content-inventory.md` §8.10).

`(chat)/index.tsx` — thin: renders `<ChatShell />`. `ChatShell` uses `useLayoutEffect` + `navigation.setOptions({ headerRight: () => <ChatHeaderActions .../> })` to install two icon buttons:
- **"New chat"** — calls `useChatSession().newChat()`.
- **"Privacy & help"** — `router.push` to the existing Home-stack Privacy screen (`/(tabs)/(home)/privacy`). No separate Help screen exists in the router tree (`docs/02-screens.md` §1), so this single affordance covers both, per the spec's single "Privacy & help" label.

Seed question handling: `/chat?q=<text>` deep link — parse with the same NFC-normalize + 1..4000-length rule as the web's `parseSeedQuestion`, send once via `sendMessage`, then clear the query param so a relaunch doesn't double-send.

## 4. Error handling

Never render server-supplied `message` text or a raw JS error's message — always the local `CHAT_ERRORS` table (§1) keyed by wire `code`, or client-only `NETWORK`/`INTERNAL` fallbacks. `requestId` is retained only for potential future support-log surfacing, never shown as user-facing text.

## 5. Testing (bun test, matches existing repo convention e.g. `src/data/content.test.ts`)

Unit-testable pure functions/logic (no RN runtime needed):
- `blocks/*.test.ts` — `parseChatDataPart` (valid/malformed/unknown, prototype-pollution guard), `parseToolStatusPart`, `chatBlocksFromParts`, `chatBlockFingerprint`.
- `src/lib/api/errors.test.ts` — `parseChatError` for JSON body, bare code, `TypeError`/network, unknown shape.
- `hooks/useStreamPhase.test.ts` — `deriveStreamPhase` truth table (all combinations of status/connected/activeToolLabel/lastTurnStopped/hasError).
- `hooks/useTranscriptCache.test.ts` — envelope validate/evict logic as pure functions (cap enforcement, oldest-first eviction, version-mismatch discard) with an injected storage stub, not real AsyncStorage.
- `hooks/usePollingRefresh.test.ts` — the poll-gate predicate as a pure function `(hasActiveGeneration, localStreamActive, appState) => boolean`, extracted so it doesn't require mounting a real `AppState` listener.

Not bun-testable — device-verified per the repo's Definition of Done (both iOS and Android, both color schemes, reduced motion):
- Full `useChatSession` wiring (`useChat`, `expo/fetch` streaming, secure-store round-trip).
- `AppState` foreground/background poll gating on-device.
- The exit-criterion end-to-end flow itself.

## Files touched / created

- New: `src/lib/session/chatSession.ts`
- New: `src/lib/api/client.ts`, `conversations.ts`, `chatTransport.ts`, `errors.ts` (+ `errors.test.ts`)
- New: `src/features/chat/blocks/index.ts` (+ `.test.ts`)
- New: `src/features/chat/hooks/useConversationBoot.ts`, `useTranscriptCache.ts` (+ `.test.ts`), `usePollingRefresh.ts` (+ `.test.ts`), `useStreamPhase.ts` (+ `.test.ts`), `useChatSession.ts`
- New: `src/features/chat/components/ChatShell.tsx`, `ChatHeaderActions.tsx`, `MessageList.tsx`, `MessageItem.tsx`, `Composer.tsx`, `WelcomeState.tsx`, `StreamStatus.tsx`, `ErrorNotice.tsx`, `LiveAnnouncer.tsx`, `blocks/ProjectGrid.tsx`, `blocks/SourceList.tsx`, `blocks/LeadFormPlaceholder.tsx`, `blocks/ContactHandoffPlaceholder.tsx`, `blocks/UnknownBlock.tsx`
- New: `src/features/chat/lib/config.ts` (ported constants: `SUGGESTED_PROMPTS`, `COMPOSER_NOTICE`, `CHAT_PRIVACY_NOTICE`, `MESSAGE_MAX_LENGTH`, `AI_IDENTITY_BADGE`), `seedQuestion.ts`
- Changed: `src/app/(tabs)/(chat)/index.tsx` (placeholder → `ChatShell`), `src/app/(tabs)/(chat)/_layout.tsx` (title string only)
- `package.json` — add `@react-native-async-storage/async-storage`

## Out of scope (deferred to later phases)

- `lead_form` / `contact_handoff` submitting UI, `src/lib/api/leads.ts`, `src/lib/api/contact.ts`, the Contact tab — **M6**.
- Conversation history / switching between past conversations — not in any phase's scope today.
- Any change to `docs/00-roadmap.md` phase boundaries or `03-api-contract.md`'s wire contract — this phase implements the existing contract, it doesn't renegotiate it.
