# Native companion app — API contract

Everything the Expo app needs to talk to `~/projects/my-portfolio`, plus the exact backend changes for the native-client channel. Implements roadmap **M4–M6** (and D8 for markdown). Locked decisions: **D5**, **D6**, **D7**, **D8**.

Cross-references: roadmap → [`00-roadmap.md`](./00-roadmap.md); Chat UI → [`02-screens.md`](./02-screens.md) §5; chat/screen copy constants → [`04-content-inventory.md`](./04-content-inventory.md) §8.10–8.11.

Base URL: `EXPO_PUBLIC_API_ORIGIN` (no trailing slash). All paths below are absolute on that origin.

---

## a) The native-client channel (D6)

Today `lib/chat/http.ts` `assertSameOrigin` throws `ChatError("VALIDATION")` when `Origin` is missing. React Native sends no `Origin`, so every mutating chat/lead call 400s. The fix is an **additional** proof path, not an exemption from auth.

### a.1 Three web-repo changes

#### 1. `lib/chat/http.ts` — `assertTrustedCaller`

Replace `assertSameOrigin` with `assertTrustedCaller(request)`:

- **Pass** when the `Origin` header's host matches the request URL host (existing behaviour), **or**
- **Pass** when the request carries **both** `x-mg-client` (non-empty, e.g. `mobile/1.0`) **and** a header-borne session (`x-mg-session` present and non-empty — actual cryptographic verify happens in session resolution).
- **Fail** with the same `ChatError("VALIDATION", …)` otherwise.

Put the CSRF rationale from D6 in a code comment: CSRF only exists for **ambient** credentials; a header-borne session cannot be attached by a browser cross-site, so accepting `x-mg-client` + `x-mg-session` is not a weakening. The cookie path stays untouched.

#### 2. `lib/chat/anonymousSession.ts` — header session

Accept `x-mg-session: <signed value>` as an alternative to the `mg_chat_session` cookie:

- Prefer cookie if present and valid; else parse `x-mg-session` with the **unchanged** `parseSession` from `lib/chat/session.ts`.
- If issuing a new session, echo the serialized value as response header `x-mg-session` **alongside** existing `Set-Cookie` via `anonymousResponseHeaders`.
- Leave untouched: `sessionTokenHash`, database visitor identity, `hashIp`, lead-draft `sid` binding.

#### 3. `GET /api/markdown` path coverage (D8)

`app/api/markdown/route.ts` is already public (no auth, no `Origin`, `text/markdown`). Path handling lives in `lib/agent/markdown.ts` `renderMarkdownForPath`.

**Verified 2026-08-15:**

| Path | Status |
|---|---|
| `/projects/<slug>` | Supported (`renderProjectCaseStudy`) |
| `/blog/<slug>` | **Not supported** — falls through to `null` → HTTP 404 markdown body |

**Required extension:** add a `/blog/<slug>` branch that reads `content/blog/<slug>.mdx` the same way projects read `content/projects/<slug>.mdx`, gated on `getPostBySlug` + `published`.

### a.2 Seven Origin-guarded routes this unblocks

These call `assertSameOrigin` today and must switch to `assertTrustedCaller`:

| Method | Path |
|---|---|
| `POST` | `/api/chat` |
| `POST` | `/api/messages/[id]/retry` |
| `POST` | `/api/conversations` |
| `DELETE` | `/api/conversations/[id]` |
| `POST` | `/api/conversations/[id]/cancel` |
| `POST` | `/api/leads` |
| `POST` | `/api/leads/draft` |

`GET /api/conversations` and `GET /api/conversations/[id]` do **not** call the Origin assert today; they still need a valid session (cookie or, after M4, `x-mg-session`).

### a.3 Contact needs no backend change

`POST /api/contact` already has **no** origin, session, content-type, or rate-limit guard. It is the one mutating endpoint that works from a native client today. Do not add native-channel requirements to it.

### a.4 Session cookie details the app must replicate

From `lib/chat/session.ts`:

| Attribute | Value |
|---|---|
| Name | `mg_chat_session` |
| Value | `v1.<base64url payload>.<HMAC-SHA256 base64url>` |
| Flags | `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=2592000` (30 days = `RETENTION_DAYS.session`), `Secure` in production, host-only |

`HttpOnly` is irrelevant to native code. Store the raw signed value in **`expo-secure-store`**. On every chat/lead request send:

```
x-mg-client: mobile/1.0
x-mg-session: <stored value>
content-type: application/json   # when body present
```

When a response includes `x-mg-session` (or `Set-Cookie` parsed if ever visible), update Secure Store.

---

## b) Endpoints the app calls

Shapes transcribed from route handlers and Zod schemas — do not invent fields.

### `POST /api/chat`

**Request** (`lib/chat/request.ts` `chatRequestSchema` + `normalizeRequest`):

```ts
{
  conversationId: string; // uuid
  message: string;        // trimmed NFC; length 1..4000 (codepoints)
  clientMessageId: string; // uuid
  locale: "en";
}
```

**Response:** AI SDK UI Message Stream (SSE) — see §c. Error: JSON `ChatErrorBody` (§e).

Native transport sends **only the newest user turn** in the body; history lives in Postgres (`prepareChatBody` pattern).

### `POST /api/messages/[id]/retry`

**Request** (`retrySchema` in the route):

```ts
{ clientRetryId: string; /* uuid */ locale: "en" }
```

`[id]` is the assistant message id. **Response:** same SSE stream as chat.

### `GET /api/conversations`

**Response:**

```ts
{ conversation: ConversationSnapshot | null }
```

Latest active owned conversation, or `null`.

### `POST /api/conversations`

**Request:** empty JSON body (Origin/trusted caller + session). **Response:** `201`

```ts
{ conversation: ConversationSnapshot }
```

### `GET /api/conversations/[id]`

**Response:**

```ts
{ conversation: ConversationSnapshot }
```

`404 NOT_FOUND` if not owned/active.

### `DELETE /api/conversations/[id]`

**Response:** `204` empty. `409 BUSY` if generation active.

### `POST /api/conversations/[id]/cancel`

Cancels in-flight generation. Used by Stop (always, on native).

### `ConversationSnapshot` (`lib/chat/conversationSnapshot.ts`)

```ts
type ConversationMessageStatus =
  | "PENDING" | "STREAMING" | "COMPLETED"
  | "FAILED" | "CANCELLED" | "BLOCKED";

type ConversationSnapshotPart =
  | { type: "text"; text: string }
  | { type: "data-projectGrid"; data: ProjectGridBlock }
  | { type: "data-sourceList"; data: SourceListBlock }
  | { type: "data-leadForm"; data: LeadFormBlock }
  | { type: "data-contactHandoff"; data: ContactHandoffBlock };

type ConversationSnapshotMessage = {
  id: string;
  role: "user" | "assistant";
  status: ConversationMessageStatus;
  parts: ConversationSnapshotPart[];
  createdAt: string; // ISO
  completedAt: string | null;
};

type ConversationSnapshot = {
  id: string;
  version: string; // ISO of updatedAt
  status: "ACTIVE";
  messages: ConversationSnapshotMessage[];
  hasActiveGeneration: boolean;
  createdAt: string;
  updatedAt: string;
};
```

### `POST /api/leads/draft`

**Request:**

```ts
{
  conversationId: string; // uuid
  draft: LeadDraft;       // see §d lead_form.draft
}
```

**Response:**

```ts
{
  draft: LeadDraft;
  leadDraftToken: string;      // max 2048
  idempotencyKey: string;      // uuid (= token jti)
  expiresAt: string;           // ISO datetime
  privacyNoticeVersion: string;
}
```

Requires `LEAD_CAPTURE_ENABLED`. Errors use chat error table.

### `POST /api/leads`

**Request** (`leadSubmissionSchema` — wire input):

```ts
{
  conversationId: string; // uuid
  leadDraftToken: string;
  idempotencyKey: string; // uuid — must equal token jti
  name: string;           // 2..120 after normalize
  email: string;          // validated email, max 254
  company?: string | null;
  opportunityType:
    | "FREELANCE_PROJECT" | "FULL_TIME_ROLE" | "CONTRACT_ROLE"
    | "CONSULTING" | "COLLABORATION" | "NETWORKING" | "OTHER";
  summary: string;
  technologies: string[]; // array on the wire (not a comma string)
  projectStage?: string | null;
  primaryTechnicalProblem?: string | null;
  timeline?: string | null;
  budgetContext?: string | null;
  preferredContact?: string | null;
  consent: true; // literal
  privacyNoticeVersion: string;
}
```

**Response:** `201`

```ts
{
  lead: { reference: string; status: "RECEIVED" };
  requestId: string;
}
```

### `POST /api/contact`

**Request** (`lib/validations/contact.ts`):

```ts
{
  name: string;    // min 2
  email: string;   // email
  subject?: string;
  message: string; // min 10
}
```

**Response:** `{ success: true }` or `{ error: string, fieldErrors?: … }` / 500 `{ error: "Failed to send message" }`.

No native session headers required.

### `GET /api/markdown?path=/blog/<slug>`

**Query:** `path` — must start with `/`. **Response:** `text/markdown; charset=utf-8`. Public. After M4, `/blog/<slug>` and `/projects/<slug>` both resolve.

---

## c) Streaming protocol

AI SDK **v7** UI Message Stream over SSE.

**Response headers (success):**

- `content-type: text/event-stream`
- `x-vercel-ai-ui-message-stream: v1`
- plus session headers (`set-cookie` / `x-mg-session`), `x-request-id`, `cache-control: no-store`

**Framing:** `data: <json>\n\n`, terminated by `data: [DONE]\n\n`. No `event:` names.

**Part types the backend emits (client-visible):**

| Part | Role |
|---|---|
| `start` | Stream open |
| `text-start` / `text-delta` / `text-end` | Assistant prose |
| `data-projectGrid` | Block (§d) |
| `data-sourceList` | Block |
| `data-leadForm` | Block |
| `data-contactHandoff` | Block |
| `data-toolStatus` | Transient retrieval label (`activeLabel`) |
| `finish` | Terminal |
| SDK error parts | Mapped via `onError` → vetted code |

All raw `tool-*` parts are stripped server-side (`stripToolStreamParts`); the client never sees tool inputs or outputs.

**Client:**

```ts
import { fetch as expoFetch } from 'expo/fetch';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

// DefaultChatTransport({ fetch: expoFetch, api: `${origin}/api/chat`, … })
// useChat({ transport, throttle: 50, … })
```

`throttle: 50` matches the web `ChatSession`. Request body carries only the newest user turn (`prepareChatBody`).

---

## d) The four block schemas

Transcribed from `lib/chat/blocks/index.ts`.

### Shared slug rules

- `slugs`: 1..6 strings matching `/^[a-z0-9-]{1,64}$/`, unique, each a **known** project slug (`isKnownProjectSlug`).

### `project_grid`

```ts
{ type: "project_grid"; version: 1; slugs: string[] }
```

Wire part: **`data-projectGrid`**.

### `source_list`

```ts
{ type: "source_list"; version: 1; slugs: string[] }
```

Wire part: **`data-sourceList`**.

### `lead_form`

```ts
{
  type: "lead_form";
  version: 1;
  draft: {
    opportunityType: OpportunityType | null;
    summary: string | null;           // max LEAD_FIELD_LIMITS.productOrRoleSummary (1000)
    technologies: string[];           // item max 80, max 20 items
    timeline: string | null;          // max 240
    projectStage: string | null;      // max 160
    primaryTechnicalProblem: string | null; // max 1000
  };
}
```

Wire part: **`data-leadForm`**.

### `contact_handoff`

```ts
{
  type: "contact_handoff";
  version: 1;
  status: "ready" | "submitted" | "failed";
  leadReference?: string; // max 64
}
```

Wire part: **`data-contactHandoff`**. Resolve display contact details from bundled `src/data/contact.ts` (D7) — never from the model.

### Transient tool status

```ts
{ version: 1; activeLabel: string | null } // label 1..60 when string
```

Wire part: **`data-toolStatus`** (not a persistent block).

### Port verbatim

`parseChatDataPart`, `parseToolStatusPart`, `chatBlocksFromParts`, and `chatBlockFingerprint` port to the app unchanged in behaviour. Unknown / invalid data parts render a safe fallback, never throw. Slug → card resolution uses bundled `projects` only.

---

## e) Error table

**Rule:** never render server-supplied `message` text. Map the wire **`code`** to the local copy table (same strings as the server so UX matches the site).

From `lib/chat/errors.ts` `CHAT_ERRORS`:

| Code | HTTP | Retryable | Visitor copy |
|---|---|---|---|
| `VALIDATION` | 400 | false | Check the message and try again. |
| `NOT_FOUND` | 404 | false | This conversation is no longer available. |
| `LEAD_DRAFT_EXPIRED` | 400 | false | This contact form has expired. Review it and try again. |
| `IDEMPOTENCY_CONFLICT` | 409 | false | That message identifier was already used. Send the message again. |
| `RETRY_REQUIRED` | 409 | true | That reply ended early. Use Retry to continue this conversation. |
| `RATE_LIMITED` | 429 | true | You've sent several messages quickly. Try again shortly. |
| `MESSAGE_BLOCKED` | 400 | false | I can't help with that request. Try asking about Mohamed's professional work. |
| `SECRET_IN_MESSAGE` | 400 | false | That message looks like it contains a credential or API key. Remove it and try again. |
| `BUSY` | 409 | true | A reply is still being written. Wait for it to finish or stop it first. |
| `UPSTREAM_TIMEOUT` | 504 | true | The reply took too long. Please retry. |
| `AI_UNAVAILABLE` | 503 | true | Mo Ghaly GPT is temporarily unavailable. |
| `CONTEXT_UNAVAILABLE` | 503 | true | This conversation is still preparing its context. Please retry shortly. |
| `INTERNAL` | 500 | true | Something went wrong. Your message was not lost; please retry. |

**Wire body:**

```ts
{
  error: { code: ChatErrorCode; message: string; retryable: boolean };
  requestId: string;
}
```

Use `code` + local table only; keep `requestId` for support logs.

**Client-only** (`features/chat/lib/parseChatError.ts`):

| Code | Retryable | Visitor copy |
|---|---|---|
| `NETWORK` | true | Check your connection and try again. |

Port `parseChatError` behaviour: JSON body → code map; bare code string; `TypeError` fetch/network → `NETWORK`; else `INTERNAL`.

---

## f) Restore / poll / stop / retry state machine

Matches web `features/chat` + durable turn semantics; native adds explicit cancel and `AppState` gating.

### Launch / restore

1. Read session from Secure Store (may be empty).
2. `GET /api/conversations` with native headers → `{ conversation }` newest active snapshot or `null`.
3. If `null`, `POST /api/conversations` to create.
4. Hydrate UI from snapshot; optional display cache may fill gaps when offline (degraded mode).

### Poll

While `hasActiveGeneration === true` **and** no local stream is running (`useChat` status not `submitted`/`streaming`):

- Poll `GET /api/conversations/{id}` every **1.5 s**.
- Drive the interval with React Native **`AppState`**: run only when `active`; stop timers in `background` / `inactive`.
- On each snapshot: replace messages, clear/set durable errors from terminal assistant status.

### Stop

1. Abort the local stream (`stop()`).
2. **Always** also `POST /api/conversations/{id}/cancel` — React Native abort propagation to the server is unreliable; the web treats Vercel cancel as primary, native must not.

### Retry

Target `POST /api/messages/{id}/retry` with `{ clientRetryId, locale: "en" }` where `id` is the assistant message id (web `regenerate` path).

### Idempotent `POST /api/chat`

Re-POSTing with the same `clientMessageId`:

| Prior attempt | Result |
|---|---|
| Completed | Replays as a **synthetic stream** |
| In-flight | `409 BUSY` |
| Terminal but failed | `409 RETRY_REQUIRED` |

Client must surface those codes via the local table and offer Retry when `retryable`.

### Seed questions

`/chat?q=` — parse with the same NFC / length rules as `parseSeedQuestion` (1..4000). Send once, then clear the query so relaunch does not double-send.

---

## g) M4 exit (recap)

1. Tests covering Origin pass, native-header pass, forged session fail (`lib/chat/http.test.ts`, session/anonymous tests).
2. `curl` without `Origin`, with `x-mg-client: mobile/1.0` and valid `x-mg-session`, completes a full chat turn.
3. Blog markdown path returns 200 for a published slug.
4. In the web repo: `bun test`, `bun run lint`, `bun run build`.
