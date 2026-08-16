# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

Keep replies extremely concise. No unnecessary fluff, no long code snippets.

---

## What this repo is

The **native companion app** to Mohamed Ghaly's portfolio — an Expo / React Native client for the Next.js 16 site at `~/projects/my-portfolio`.

Five tabs, in this fixed order: **Home · Blogs · Experience · Contact · Settings**. About, Projects, Project detail, Skills and Privacy are pushed inside the **Home stack**, not tabs. Chat is not a tab — it's a root-level modal (`src/app/chat/`, route `/chat`) reached from a global floating action button (`ChatFab`, mounted above `NativeTabs`), visible on every tab and every pushed screen.

**Status:** M0, M1, M2, M3, M4, M5, M6 and M7 landed — five-tab tree boots on iOS and Android; `src/theme/` tokens, bundled fonts and the ten `src/components/ui/` primitives are in, with a `__DEV__` token gallery at `(home)/gallery`; `src/data/` and `src/types/` are ported from the web repo via `scripts/sync-content.ts`, with project cover images bundled and a `bun test` exit-criterion test; Home, About, Projects, Project detail, Skills, Experience and Privacy all render from bundled data with no network calls. A 2026-08-15 native UI polish pass on top of M3 fixed those screens reading as mobile-web (native large-title/blur headers, `Button` icon slot, haptics, chevron affordances, pull-to-refresh) — see `01-design-system.md` §10–11; apply those conventions to every screen built from here on. M4 opened the native-client channel (`x-mg-client`/`x-mg-session` trust path) for chat/lead routes in the web repo. M5 shipped Mo Ghaly GPT as a native-streaming chat modal (`src/app/chat/`, reached via `ChatFab`) — session store, `expo/fetch` transport, block parsers resolved against bundled data, restore/poll/stop/retry state machine, and local-copy-only error mapping; device-verified send/stream/stop/retry/background/relaunch and rate-limit/blocked/network error copy on iOS and Android, both color schemes, reduced motion. M6 wired the real Contact tab (`react-hook-form` + zod against `POST /api/contact`) and the in-chat `LeadForm`/`ContactHandoff` blocks (`POST /api/leads/draft` → `POST /api/leads` through a testable draft-fetch-then-submit state machine, `ContactHandoff` resolving all contact detail from bundled data per D7); `tsc`/lint/`bun test` are green and **M6 is device-verified on iOS** (Contact tab happy/error paths, chat `LeadForm`/`ContactHandoff` happy path, light/dark mode, keyboard) — **Android was not tested** (user accepted iOS-only verification for M6; run the Android pass whenever it's convenient, no later than before M8). M7 wired the real Blogs tab (bundled index from `getPublishedPosts()`, article body via `GET /api/markdown?path=/blog/<slug>` through a shared markdown client/hook also reused for Project detail's case-study body per D8) plus a `NetInfo`-backed react-query online/focus-manager wiring (`src/lib/query-client.ts`); `tsc`/lint/`bun test` are green. **M8 (offline caching, deep links, polish) is next.** Update this line as phases land.

---

## Read the plan before writing code

`docs/` is the implementation contract, not background reading. Read the relevant document before touching the area it covers.

| File | Read it before |
|---|---|
| `docs/00-roadmap.md` | anything — it holds phases **M0–M10**, the dependency order, and decision record **D1–D8** |
| `docs/01-design-system.md` | any colour, font, spacing, radius, motion or UI primitive |
| `docs/02-screens.md` | any screen, route, navigation or section-order work |
| `docs/03-api-contract.md` | any network call, chat streaming, session handling or lead/contact submission |
| `docs/04-content-inventory.md` | any data type, record, or user-visible copy string |

**Work one phase at a time.** Do not start M*n+1* until M*n*'s bold **Exit:** criterion is objectively true. If a task doesn't map to a phase, say so before starting it.

---

## The companion web repo

`~/projects/my-portfolio` — Next.js 16 App Router portfolio. **It is the source of truth for content and for every backend the app talks to.** It is not a sibling package; it is a separate repository.

**Consult it when you need:**

| Need | Where to look |
|---|---|
| Portfolio data (projects, experience, skills, education, courses, contact, blog) | `lib/data/*.ts` and `types/*.ts` — the origin of everything in `src/data/` |
| Design tokens | `app/globals.css` `@theme inline { ... }` — the origin of `src/theme/colors.ts` |
| Exact screen copy, section order, component behaviour | `features/<name>/` and `app/(site)/` |
| Chat request/response shapes and guard order | `app/api/chat/route.ts`, `lib/chat/request.ts` |
| Chat UI block schemas | `lib/chat/blocks/index.ts` |
| Visitor-facing error codes and copy | `lib/chat/errors.ts` |
| Anonymous session signing | `lib/chat/session.ts`, `lib/chat/anonymousSession.ts` |
| Limits, retention, suggested prompts, composer notice | `lib/chat/config.ts` |
| Lead schemas | `lib/leads/schema.ts`, `lib/leads/submission.ts` |
| Case-study and article prose | `content/projects/*.mdx`, `content/blog/*.mdx` (no frontmatter — metadata lives in `lib/data/`) |

**Rules for cross-repo work:**

- **Read-only by default.** The only phase that deliberately edits the web repo is **M4** (the native-client channel); M8 and M9 touch it for well-known files and device registration. Any other edit there needs to be raised first.
- **Never copy a value by memory.** If `docs/04-content-inventory.md` and the web repo disagree, the web repo wins — fix the doc in the same change.
- When the web repo's data changes, re-run `scripts/sync-content.ts` (added in M2) rather than hand-editing `src/data/`.
- The web repo has its own `CLAUDE.md` and `AGENTS.md` with binding rules. Honour them when working there — including *"before writing any Next.js code, read the relevant guide in `node_modules/next/dist/docs/`"*.

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Bun 1.3 (lockfile is `bun.lock`) |
| Framework | Expo SDK 57 · React Native 0.86.2 · React 19.2.3 |
| Routing | `expo-router` 57, typed routes, `NativeTabs` from `expo-router/unstable-native-tabs` |
| Architecture | New Architecture (mandatory) · React Compiler enabled |
| Language | TypeScript 6 (strict), `@/*` → `src/*`, `@/assets/*` → `assets/*` |
| Styling | Typed theme + `StyleSheet.create` — **no NativeWind** (D3) |
| Animation | `react-native-reanimated` 4 |
| Data | Bundled static TypeScript (D2); `@tanstack/react-query` for the two network reads |
| AI | AI SDK 7 `useChat` over `expo/fetch` (D5) |

## Commands

```bash
bun install          # Install dependencies
bun run start        # Expo dev server
bun run ios          # Open in iOS simulator
bun run android      # Open in Android emulator
bun run lint         # expo lint
bunx tsc --noEmit    # Typecheck
bun test             # Unit tests
bun run sync-content # Re-port src/data + src/types from the web repo
```

---

## Architecture invariants

### Navigation

- Tab order is **Home · Blogs · Experience · Contact · Settings** and does not change. `NativeTabs.Trigger` names are `(home)`, `blog`, `experience`, `contact`, `settings` — `(home)` is deliberately a route group (transparent, maps to bare `/`); the other four are literal folders so `/blog`, `/experience`, `/contact`, `/settings` are real, reachable deep-link paths. (Fixed 2026-08-16: all five originally shipped as groups, which left the latter four with no reachable path — they silently fell through to `blog/[slug].tsx`'s dynamic segment. Caught during M8 device-based deep-link verification.)
- About, Projects, Project detail, Skills and Privacy live **only** in the Home stack. Do not promote one to a tab.
- Chat is a root-level modal Stack screen (`src/app/chat/`, route `/chat`, `presentation: 'modal'`), not a tab. It's a real path segment, not a `(group)` — a group here would resolve to bare `/` and collide with `(tabs)/(home)/index.tsx` for the app's initial route. It's reached from `ChatFab` (`src/components/chat-fab.tsx`), mounted once at the `(tabs)` layout level so it overlays every tab and every pushed screen; it disappears automatically while the modal is presented since the whole `(tabs)` screen backgrounds.
- The router tree is specified in `docs/02-screens.md` §1. Adding a screen means adding it there too.
- Keep `NativeTabs` (D1) — the tab bar is deliberately platform-native while everything above it is brand. D1 originally locked Chat in as a tab; this was superseded on 2026-08-16 in favor of the FAB + modal pattern above.

### Content

- Portfolio data is **static, typed and bundled** in `src/data/` (D2). Do not add a database, a CMS, or a content API for ordinary content.
- The web repo's `lib/data/` is upstream. `src/data/` is a port kept honest by `scripts/sync-content.ts`.
- Only two things come over the network: **blog article bodies** (`GET /api/markdown`) and **chat**. Every other screen must render in airplane mode.

### Design

- Tokens live in `src/theme/`, ported from `app/globals.css`. Never hardcode a hex outside `src/theme/colors.ts`.
- **Never call `StyleSheet.create(...)` inside a component's render body.** It reallocates and re-registers every style object on every render. Define `const styles = StyleSheet.create({...})` at module scope in the same file, below the component, holding only values that don't vary per render (layout, spacing, `Typography`/`FontFamilies` entries). Values that depend on theme, props, or state (`colors.*`, conditional booleans) go inline, merged via the style array: `style={[styles.root, { backgroundColor: colors.accent }]}`. If a style has nothing static to hoist, skip `StyleSheet.create` entirely and pass a plain inline object. Reference implementations: `src/app/+not-found.tsx`, `src/components/placeholder-screen.tsx`.
- **Radius is `0` everywhere.** Square corners are a rule the web enforces with a test; keep it.
- One easing curve: `Easing.bezier(0.16, 1, 0.3, 1)`. Entrance is 600 ms fade + 20 px rise; list stagger 50–60 ms.
- Guard every non-essential animation with `useReducedMotion()`.
- Light mode uses `accentText` (`#00805A`) for type and icons — the raw `#00E5A0` accent is 1.58:1 on light backgrounds and is for fills, dots and rules only.
- Fonts come from `@expo-google-fonts/{space-mono,dm-sans,jetbrains-mono}` (loaded via `expo-font` `useFonts` from `src/theme/fonts.ts`); the splash holds until they resolve.
- **Icons always come from `@expo/vector-icons`.** Do not add a separate icon library (e.g. `lucide-react-native`, `react-native-vector-icons`) or inline SVGs for iconography.
- **Native chrome, icons and haptics are specced in `docs/01-design-system.md` §10–11** — a UI polish pass (2026-08-15) fixed the app reading as a mobile-web view. Read those sections before building any new screen or list row: stack headers use native large-title + blur on iOS (flat themed bar on Android) via each `_layout.tsx`'s `screenOptions`, not per-screen; `Button` takes an `icon` prop (Ionicons) instead of an arrow character embedded in the label string; primary-button presses and card-style navigations fire haptics through `src/lib/haptics.ts` (`lightImpact()` / `selectionChanged()`) — do not call `expo-haptics` directly from a screen; a pushable card/list row gets a trailing `chevron-forward`, not accent-coloured link text (see `ProjectCard`); a screen whose content can meaningfully reload takes `Screen`'s `onRefresh`/`refreshing` props. Full rationale: `docs/superpowers/specs/2026-08-15-native-ui-polish-design.md`.

### Chat and network

- Every request goes through the single client in `src/lib/api/` — it injects `Origin`, `x-mg-client` and `x-mg-session`, and persists the reissued session to `expo-secure-store`. Do not call `fetch` directly from a screen.
- Chat streaming uses `expo/fetch`, not the global `fetch` — React Native's default returns `response.body === null` and the stream cannot be read (D5).
- **Stop always calls `POST /api/conversations/{id}/cancel`** in addition to aborting; RN abort propagation is unreliable.
- Chat UI blocks carry **slugs and statuses only** (D7). Resolve project cards and contact channels against bundled data — never render a title, URL or phone number that came over the wire.
- Never render server-supplied error text. Map the wire *code* to the local copy table ported from `lib/chat/errors.ts`.
- PostgreSQL on the web side is the only chat-history source. Send one new message per turn; never upload a transcript as history.

### Environment

- **Only `EXPO_PUBLIC_*` variables belong in this repo.** Everything shipped in an Expo bundle is readable by anyone with the app.
- Server secrets — `DATABASE_URL`, `OPENAI_API_KEY`, `APP_SESSION_SECRET`, `AUTH_SECRET`, `RESEND_API_KEY`, `ADMIN_ALLOWLIST` and friends — must never appear here in any form. They live in the web repo only. (The scaffold shipped with a copied `.env`; M0 scrubs it.)
- Keep `.env.example` synchronised with what the app actually reads.

```
EXPO_PUBLIC_API_ORIGIN      Origin of the Next.js site, no trailing slash
EXPO_PUBLIC_SITE_URL        Canonical site URL for share and universal links
EXPO_PUBLIC_LINKEDIN_URL
EXPO_PUBLIC_GITHUB_URL
EXPO_PUBLIC_YOUTUBE_URL
```

---

## Skills

Repository skills are installed under `.claude/skills/` and `.agents/skills/`. Use the matching one:

- Bun commands and packages → `bun-first`
- TypeScript design → `clean-typescript`
- React components → `modern-best-practice-react-components`
- Routing, layouts, deep links → `expo-router`
- Project layout → `expo-project-structure`
- Theming and primitives → `expo-design-system`, `expo-native-ui`, `expo-ui`
- Network and caching → `expo-data-fetching`
- Native modules, dev builds, SDK upgrades → `expo-module`, `expo-dev-client`, `expo-upgrade`
- Builds, updates, store submission (M10) → `eas-workflows`, `eas-app-stores`, `eas-update-insights`, `eas-simulator`

`expo-tailwind-setup` is installed but **not applicable** — D3 rules out NativeWind.

For version-sensitive third-party work, check the current official documentation; delegate substantial lookups to the read-only `docs-explorer` agent in `.claude/agents/`.

---

## Delegating implementation

**Implementation work goes to Cursor, not into this context.** When a task means writing or
refactoring more than a couple of files against a spec that already exists, hand it to the
`cursor-delegate` skill instead of typing the code here — it keeps this session's tokens for
planning and review.

```bash
node .claude/skills/cursor-delegate/scripts/relay.mjs \
  --brief <brief>.txt --cd /Users/mohamedghaly/projects/my-portfolio-app \
  --model cursor-grok-4.5-high-fast --timeout 2h
```

- **Pin the model:** `cursor-grok-4.5-high-fast`. Do not fall back to `auto`.
- **Claude owns judgment; Cursor owns typing.** Claude writes the brief, re-runs the gates itself,
  reads the whole diff, and commits. Cursor never runs `git add` or `git commit` — say so in every
  brief.
- **Point briefs at `docs/`.** The spec is in the repo, so a brief names the document instead of
  restating it, and carries only the deltas, the real gates (`bunx tsc --noEmit`, `bun run lint`),
  and the report contract.
- **One phase slice per brief.** Split a phase into sequential dispatches rather than sending one
  sprawling brief; the next dispatch starts only after the previous diff is reviewed and green.
- **Do not delegate:** planning, roadmap or `docs/` changes, anything touching `.env` or secrets,
  cross-repo edits in `~/projects/my-portfolio`, and one-file tweaks.

---

## Definition of done

- The phase's **Exit:** criterion in `docs/00-roadmap.md` is objectively true.
- Add or update focused tests for changed behaviour.
- `bun run lint` and `bunx tsc --noEmit` pass.
- Run the app on **both** iOS and Android for anything touching layout, navigation, keyboard, streaming, or safe areas — simulator parity is not a given.
- Check the screen in both colour schemes and with reduced motion enabled.
- If the change drifts from a document in `docs/`, update the document in the same change.
- Review the final diff for secrets, generated files, and unrelated edits.
