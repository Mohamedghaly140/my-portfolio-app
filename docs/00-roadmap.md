# Native companion app — executable roadmap

Implementation plan for turning the Expo SDK 57 scaffold in this repository into the native companion to the Next.js 16 portfolio at `~/projects/my-portfolio`.

**Product:** a five-tab app — **Home · Blogs · Chat · Experience · Contact** — with About, Projects, Project detail, Skills, and Privacy pushed inside the Home stack.

**Status:** planning only. No application code has been changed yet.

Cross-references: design system → [`01-design-system.md`](./01-design-system.md); every screen → [`02-screens.md`](./02-screens.md); backend contract → [`03-api-contract.md`](./03-api-contract.md); content inventory → [`04-content-inventory.md`](./04-content-inventory.md).

---

## 1. Context

| Repo | Role today |
|---|---|
| `~/projects/my-portfolio` | Finished Next.js 16 App Router portfolio. Static typed data in `lib/data/`, chat + leads on Postgres, public markdown via `GET /api/markdown`. **Read-only reference for app work; M4 (and later device/push work) edits it deliberately.** |
| `~/projects/my-portfolio-app` (this repo) | Stock Expo SDK 57 scaffold: expo-router 57, RN 0.86.2, React 19.2.3, New Architecture, React Compiler + typed routes, `src/` with `@/*`, `NativeTabs` already used in `src/components/app-tabs.tsx`, two placeholder tabs (`index`, `explore`). |

What is being built: a brand-faithful native client that bundles portfolio content, streams Mo Ghaly GPT over a native-safe fetch path, and captures leads / contact through the existing site APIs after a small native-client channel lands on the backend.

---

## 2. Decision record (locked)

| ID | Decision | Rationale |
|---|---|---|
| **D1** | 5 native tabs via `NativeTabs`; About / Projects / Project detail / Skills / Privacy live in the Home stack. | user-specified; keeps the tab bar platform-native (liquid glass, haptics, scroll-to-top) while everything above it is brand. |
| **D2** | Portfolio content is bundled static TypeScript ported from the web repo's `lib/data/`. | mirrors the web invariant "portfolio data is static and typed; do not add a database for ordinary content." Instant first paint, works offline. Blog prose and chat are the only network reads. |
| **D3** | Typed theme + `StyleSheet.create`, **no NativeWind**. | zero new transform layers, best React-Compiler compatibility, extends the existing `src/constants/theme.ts`. |
| **D4** | Same brand, native conventions; ship a derived light theme. Identical palette / typography / square corners, but native list, press, sheet and navigation idioms instead of web hover states. | brand continuity without pretending RN is a browser. |
| **D5** | Chat is a fully native streaming client on `expo/fetch` + `useChat` + `DefaultChatTransport`. | React Native's default XHR-backed `fetch` returns `response.body === null`, so the AI SDK stream cannot be read; `expo/fetch` is the documented AI SDK path for Expo. Biggest integration risk; gets its own phase. |
| **D6** | The backend gains a native-client channel, not an exemption. `lib/chat/http.ts` `assertSameOrigin` hard-requires an `Origin` header and React Native sends none, so every mutating chat/lead call 400s today. Fix by accepting a header-borne session (`x-mg-session`) plus an explicit `x-mg-client` marker as an alternative proof. CSRF only exists for **ambient** credentials — a header-borne session cannot be attached by a browser cross-site — so this is not a weakening. The cookie path is untouched. | unlocks the seven Origin-guarded routes without changing browser CSRF posture. Details in [`03-api-contract.md`](./03-api-contract.md) §a. |
| **D7** | Chat UI blocks stay slug-only over the wire; the app resolves them against bundled data. | Preserves the web's structural guarantee that the model can never author a project title, image, URL or phone number. `contact_handoff` resolves from bundled `contact.ts` exactly as the web does. |
| **D8** | Blog article bodies come from the existing `GET /api/markdown` route — public, no auth, no `Origin`, `text/markdown`. **Verified:** `renderMarkdownForPath` in `lib/agent/markdown.ts` handles `/projects/<slug>` but **not** `/blog/<slug>`, which falls through to `null` → 404. M4 adds the blog case. | Extending one existing public renderer beats standing up a new endpoint with its own guards, caching, and allowlist. |

---

## 3. How to execute

One phase at a time. Do not start Mn+1 until Mn's bold **Exit:** criterion is objectively true. Prefer small commits inside a phase; never leave the tree half-migrated across a phase boundary that other work depends on (especially M0 → M1 and M4 → M5).

M4 is the only phase whose primary edits land in `~/projects/my-portfolio`. Every other phase edits this app repo (M8/M9 touch the web repo only for well-known / device registration pieces called out inline).

---

## 4. Phases

### M0 — Foundation & hygiene

**Purpose:** scrub secrets the app must never ship, brand the Expo config, reshape the router into the five-tab tree, and install the deps later phases need.

**Blocking security item (do this first):**

The app repo's `.env` currently holds full production **server** secrets copied from the web repo — `DATABASE_URL`, `DIRECT_URL`, `OPENAI_API_KEY`, `APP_SESSION_SECRET`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `RESEND_API_KEY`, `ADMIN_ALLOWLIST`, `WEB_BOT_AUTH_PRIVATE_KEY_D`. The file is gitignored and untracked, so nothing reached git, but an Expo app has no server, only `EXPO_PUBLIC_*` reaches the bundle, and none of these have any use in this repo.

1. Delete every server secret from `.env`.
2. Replace with client-safe public vars only:
   - `EXPO_PUBLIC_API_ORIGIN` — origin of the Next.js site (no trailing slash), e.g. `https://moghaly.com`
   - `EXPO_PUBLIC_SITE_URL` — same origin used for share / canonical links
   - `EXPO_PUBLIC_LINKEDIN_URL`
   - `EXPO_PUBLIC_GITHUB_URL`
   - `EXPO_PUBLIC_YOUTUBE_URL`
3. Rotating any secret that left the machine is the owner's call; the plan does not automate rotation.

**Config (`app.json`):**

1. Splash plugin `backgroundColor`: `#208AEF` → `#0A0A0F`.
2. Android `adaptiveIcon.backgroundColor`: `#E6F4FE` → `#0A0A0F`.
3. Add `ios.bundleIdentifier` and `android.package` (suggest `com.moghaly.app`; confirm before first EAS build).
4. Keep `scheme: "moghaly"`.

**Router restructure** — replace the two-tab scaffold with the tree in [`02-screens.md`](./02-screens.md) §1. Wire `NativeTabs.Trigger` names `(home)`, `(blog)`, `(chat)`, `(experience)`, `(contact)` in that order. Each tab's `index` can be an empty `Screen` placeholder labelled correctly.

**Delete template leftovers:**

- `src/app/explore.tsx`
- `src/components/web-badge.tsx`
- `src/components/hint-row.tsx`
- `src/components/animated-icon.tsx` / `animated-icon.web.tsx`
- `src/components/ui/collapsible.tsx`

**Dependencies to add** (Bun-first per repo skill): `expo-secure-store`, `expo-haptics`, `expo-clipboard`, `@tanstack/react-query`, `zod`, `ai`, `@ai-sdk/react`.

**Files created / changed:** `.env` (local only), `.env.example` (public keys only, no secrets), `app.json`, `src/app/**` tree as above, `src/components/app-tabs.tsx` (+ `.web.tsx` if retained), `package.json` / lockfile, delete the leftovers listed above.

**Exit:** iOS and Android boot to five empty, correctly labelled tabs; `tsc --noEmit` clean.

---

### M1 — Design system

**Purpose:** port the web palette, type, spacing, motion, and UI primitives into typed RN modules. Full token tables, type signatures, and primitive contracts live in [`01-design-system.md`](./01-design-system.md).

**Tasks:**

1. Create `src/theme/{colors,typography,spacing,motion,index}.ts` and a `useTheme()` hook that replaces `src/hooks/use-theme.ts`.
2. Bundle Space Mono / DM Sans / JetBrains Mono `.ttf` files under `assets/fonts/`; load with `expo-font` `useFonts` and hold the splash until they resolve (root `_layout.tsx`).
3. Implement primitives in `src/components/ui/`: `Text`, `Badge`, `Button`, `Card`, `SectionLabel`, `PromptChip`, `Divider`, `Screen`, `Reveal`, `Skeleton` — props and variants as specified in `01-design-system.md`.
4. Radius is `0` everywhere (square corners are a rule; the web enforces this with `lib/ui/prose.test.ts` forbidding `rounded-*`).
5. Add a **dev-only** token gallery route at `src/app/(tabs)/(home)/gallery.tsx`, guarded by `__DEV__`, that renders every primitive in both colour schemes. Not `_gallery.tsx` — expo-router treats only `_layout` as special, so an underscore-prefixed file still becomes a real route.

**Files:** `src/theme/**`, `src/hooks/use-theme.ts` (replace), `src/components/ui/**`, `assets/fonts/**`, root layout splash gating, gallery screen.

**Exit:** a dev-only token gallery screen renders every primitive in both colour schemes.

---

### M2 — Content layer

**Purpose:** make the web's `lib/data/` the source of truth inside the app, with a sync script and bundled cover images so static screens never hit the network. Verbatim types, records, and counts: [`04-content-inventory.md`](./04-content-inventory.md).

**Tasks:**

1. Port dependency-free modules from the web repo:
   - `lib/data/{projects,experience,education,courses,skills,blog,contact}.ts` → `src/data/`
   - `types/{project,blog,skill,education,course}.ts` → `src/types/` (plus an `experience` type extracted from the inline `ExperienceItem` in the web `lib/data/experience.ts`)
2. Rewrite `@/` imports during the port so they resolve under the app's alias.
3. Add `scripts/sync-content.ts`: copy from `~/projects/my-portfolio/lib/data` + `types`, rewrite imports, fail loud if a ported file still imports a server-only module.
4. Write `src/data/README.md` stating that the web repo's `lib/data/` is the source of truth and that hand-edits here will be overwritten by the sync script.
5. Copy the five project cover `.webp` files (`orth`, `vimi`, `meshwarak`, `aydi-field`, `aydi-business`) into `assets/projects/` and switch each `coverImage.src` to a `require()` handle (or a small `coverImage` map keyed by slug). Letter fallback stays for projects without covers.
6. Unit test asserting record counts and image resolution (see Exit).

**Files:** `src/data/**`, `src/types/**`, `scripts/sync-content.ts`, `assets/projects/*.webp`, `src/data/README.md`, test under e.g. `src/data/content.test.ts`.

**Exit:** a unit test asserts the record counts (**10** projects, **3** experience entries, **2** education, **5** courses, **5** skill categories / **32** skills, **1** blog post) and that every project slug resolves to a bundled image or the letter fallback.

> **Source note:** the brief said 31 skills; `lib/data/skills.ts` currently totals **32** (Mobile 6 + Frontend 9 + Backend 7 + Architecture 4 + Tools & AI 6). The exit criterion tracks the source of truth.

---

### M3 — Home, About, Projects, Project detail, Skills, Privacy, Experience

**Purpose:** ship every static screen against bundled data. No network calls. Screen structure: [`02-screens.md`](./02-screens.md); visible strings: [`04-content-inventory.md`](./04-content-inventory.md) §8.

**Tasks:**

1. Implement each screen per [`02-screens.md`](./02-screens.md) section order (verified against `features/*` on the web).
2. Home: Hero → StatsStrip → FeaturedProjects → LatestArticle → SkillsHighlight → AboutTeaser → AskMohamedCTA (in-content, switches to Chat tab) → CTABanner.
3. About / Projects / Project detail / Skills / Privacy push inside `(home)` stack; Experience is its own tab.
4. Project detail: metadata from bundled `projects.ts`; case-study body via offline-friendly path for M3 (short description + meta is enough to paint; full MDX body is deferred to M7's markdown client or a later offline cache of `GET /api/markdown?path=/projects/<slug>` — prefer fetching markdown when online and falling back to description in airplane mode so the Exit still holds).
5. AskMohamedCTA / PromptChip: no floating FAB; press navigates to `/(tabs)/(chat)` optionally with `?q=`.
6. External links (CV PDF, store URLs, social) use `expo-linking` / `Linking.openURL`.

**Files:** screens under `src/app/(tabs)/(home)/**` and `(experience)/**`, feature components under `src/features/{home,about,projects,skills,experience,privacy}/**` (or colocated — match whatever layout M0 chose), navigation helpers.

**Exit:** every screen renders in airplane mode.

---

### M4 — Backend native-client channel

**Purpose:** unblock chat and lead mutations from a React Native client. Worked in `~/projects/my-portfolio`, not this app repo. Full design in [`03-api-contract.md`](./03-api-contract.md) §a.

**Tasks (web repo):**

1. Replace `assertSameOrigin` with `assertTrustedCaller(request)` in `lib/chat/http.ts` — Origin host match **or** (`x-mg-client` + header-borne session). Same `ChatError("VALIDATION")` on failure. CSRF rationale from D6 in a code comment.
2. Teach `lib/chat/anonymousSession.ts` to accept `x-mg-session: <signed value>` as an alternative to the `mg_chat_session` cookie, verified by the **unchanged** `parseSession` in `lib/chat/session.ts`; echo any reissued value as an `x-mg-session` response header alongside existing `Set-Cookie`. Leave `sessionTokenHash`, visitor identity, `hashIp`, and lead-draft `sid` binding untouched.
3. Verify `renderMarkdownForPath` in `lib/agent/markdown.ts`: `/projects/<slug>` already works; `/blog/<slug>` currently returns `null`. Extend with a blog case-study renderer that reads `content/blog/<slug>.mdx` the same way projects do (D8).
4. Update call sites that import `assertSameOrigin` to `assertTrustedCaller` (the seven mutating routes listed in `03-api-contract.md`).
5. Tests in `lib/chat/http.test.ts` and `lib/chat/session.test.ts` (or anonymous-session tests) covering Origin pass, missing Origin fail, native headers pass, forged session fail.

**Exit:** new tests in `lib/chat/http.test.ts` and `lib/chat/session.test.ts`; a `curl` with no `Origin`, `x-mg-client: mobile/1.0` and a valid `x-mg-session` completes a full chat turn; then `bun test`, `bun run lint`, `bun run build` all green in the web repo.

---

### M5 — Chat tab, native streaming

**Purpose:** ship Mo Ghaly GPT on device. Details in [`03-api-contract.md`](./03-api-contract.md) §§b–f and [`02-screens.md`](./02-screens.md) Chat.

**Tasks:**

1. Session store: read/write `x-mg-session` value via `expo-secure-store`; attach `x-mg-client: mobile/1.0` and `x-mg-session` on every chat/lead request.
2. API client: `expo/fetch` as the `fetch` implementation passed to `DefaultChatTransport`.
3. Port block parsers (`parseChatDataPart`, `parseToolStatusPart`, `chatBlocksFromParts`, `chatBlockFingerprint`) and resolve slugs against bundled `projects` / `contact` (D7).
4. Boot: `GET /api/conversations` → restore or `POST /api/conversations`; seed via `?q=` (deep link / in-app CTA).
5. Streaming UI: composer, message list, stream status, stop, retry, suggested prompts, error notice mapped from local copy table only. Follow `01-design-system.md` §10–11 for chrome: send/retry as `Button` with an `icon`, not an embedded arrow; haptics via `src/lib/haptics.ts`, not raw `expo-haptics` calls.
6. Restore / poll / stop / retry state machine per `03-api-contract.md` §f — poll every 1.5 s while `hasActiveGeneration` and no local stream; drive with `AppState`; stop always also `POST .../cancel`.
7. Error mapping: never render server `message` text; map wire `code` to local table (+ client `NETWORK`).

**Files:** `src/features/chat/**`, `src/lib/api/**`, `src/lib/session/**`, `(chat)/index.tsx`, secure-store session module.

**Exit:** on a physical device: send → stream → stop → retry → background → relaunch, transcript intact; rate-limit, blocked-message and network errors each render the correct copy.

---

### M6 — Lead capture + Contact tab

**Purpose:** lead form blocks inside chat, plus the standalone Contact tab.

**Tasks:**

1. Port `LeadForm` / `ContactHandoff` UI against `POST /api/leads/draft` and `POST /api/leads` (shapes in `03-api-contract.md` §b). Native session headers required.
2. Contact tab: form → `POST /api/contact` (no Origin/session change needed — works from native today). Contact links from bundled `contact.ts` + `EXPO_PUBLIC_*` social URLs.
3. Privacy notice version: surface the same version string the draft endpoint returns; link into Home-stack Privacy screen.
4. Haptics on successful submit via `src/lib/haptics.ts` (see `01-design-system.md` §11); clipboard helpers where the web copies a lead reference.

**Files:** `(contact)/index.tsx`, chat block components, `src/lib/api/leads.ts`, `src/lib/api/contact.ts`.

**Exit:** a consented lead can be submitted from chat on device; Contact form returns success; both paths show trusted local copy on failure.

---

### M7 — Blogs tab

**Purpose:** list from bundled metadata; article body from `GET /api/markdown?path=/blog/<slug>` (D8).

**Tasks:**

1. Blog index from `getPublishedPosts()` (bundled). List rows follow `ProjectCard`'s chevron-affordance pattern (`01-design-system.md` §11), not text-link footers; the index screen is a real pull-to-refresh candidate (`Screen`'s `onRefresh`/`refreshing`, §11) since articles can actually change.
2. Article screen: header from bundled post; body fetched as markdown, rendered with a small RN markdown component (square corners, brand type). Cache the response in react-query.
3. Confirm M4's blog path extension is live before declaring done; 404 markdown must show a local error state, not crash.
4. Optional: project case-study bodies can reuse the same markdown client against `/projects/<slug>`.

**Files:** `(blog)/index.tsx`, `(blog)/[slug].tsx`, markdown fetch + renderer, react-query hooks.

**Exit:** published article opens online; airplane mode still shows the index and a clear offline body state; `tsc --noEmit` clean.

---

### M8 — Offline caching, deep links, polish

**Purpose:** make the app feel installed, not like a thin web wrapper.

**Tasks:**

1. Persist react-query cache (AsyncStorage or equivalent) for markdown and any non-sensitive GETs. Chat transcript remains server-authoritative + secure-store session; do not put session tokens in the query cache.
2. Universal links: serve `apple-app-site-association` and `assetlinks.json` from the Next.js site's `public/.well-known/`, mapping `/projects/<slug>`, `/blog/<slug>`, and `/chat?q=` onto the tab stacks. Keep `moghaly://` custom scheme.
3. Share sheet for project / blog URLs (`EXPO_PUBLIC_SITE_URL` + path).
4. Haptics on tab select (primary-action and card-selection haptics already landed in the 2026-08-15 UI polish pass, `01-design-system.md` §11 — this task is now just the remaining tab-select case, via the same `src/lib/haptics.ts`); respect `useReducedMotion()` for Reveal / list stagger.
5. VoiceOver / TalkBack pass on Home, Chat, Contact.
6. Route-level error boundaries (`+not-found.tsx` already in tree; add stack `error` boundaries where expo-router supports them).

**Files:** linking config in `app.json`, web `public/.well-known/*`, query persister, share helpers, a11y fixes.

**Exit:** cold-open of `https://<site>/projects/orth-app` lands on the project detail screen in the Home stack; Chat seed `?q=` sends once; reduced-motion disables non-essential animation.

---

### M9 — Push notifications

**Purpose:** optional engagement channel without inventing a second mailer.

**Tasks:**

1. App: `expo-notifications` permission flow, obtain Expo push token, `POST /api/devices` with the native session headers.
2. Web: `device_tokens` table + `POST /api/devices` route; send through the existing `lib/notifications/transport.ts` boundary (the only module allowed to import `resend`). Prefer Expo's push API for device delivery; keep Resend for email. Do not import `resend` from new modules.
3. Triggers: new blog article; optionally a chat reply that completed while the app was backgrounded.
4. Privacy: document device-token retention on the Privacy screen; token delete on logout / uninstall best-effort.

**Files:** app notification module; web Prisma migration + route + sender; Privacy copy update.

**Exit:** a TestFlight / internal-track build receives a test push; disabling permission stops registration; `bun test` green in the web repo.

---

### M10 — CI, EAS builds, store submission

**Purpose:** repeatable builds and a path to the stores.

**Tasks:**

1. `eas.json` profiles: `development`, `preview`, `production`.
2. EAS Update channels aligned to those profiles.
3. Brand icon + splash (replace Expo placeholders) using `#0A0A0F` / accent.
4. App Store and Play listings (copy, screenshots, privacy questionnaire aligned with `/privacy`).
5. TestFlight + Play internal track first.
6. GitHub Actions on PRs: typecheck + unit tests + `eas build --profile preview` (or a cheaper fingerprint check if build minutes are constrained — document the choice).

**Files:** `eas.json`, `.github/workflows/*`, store metadata, final assets.

**Exit:** a `preview` build installs from TestFlight / Play internal; CI is green on `main`.

---

## 5. Dependency graph (summary)

```
M0 → M1 → M2 → M3
                ↘
M4 (web) ───────→ M5 → M6
                ↘ M7
M3 + M5 + M7 → M8 → M9 → M10
```

M4 must precede M5/M6. M2 precedes M3 and M5 (slug resolution). M1 precedes every screen phase.
