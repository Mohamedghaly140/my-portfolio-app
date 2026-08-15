# Native companion app — screens

Every screen in every stack. Section order verified against `~/projects/my-portfolio/features/*` and the project / blog slug pages (2026-08-15). Implements roadmap **M3**, **M5–M8** UI slices. Decisions: **D1**, **D4**.

Cross-references: tokens → [`01-design-system.md`](./01-design-system.md); chat/API → [`03-api-contract.md`](./03-api-contract.md); phase order → [`00-roadmap.md`](./00-roadmap.md); verbatim copy & data → [`04-content-inventory.md`](./04-content-inventory.md).

---

## 1. Expo Router tree

```
src/app/_layout.tsx                      root: fonts, splash, ThemeProvider, QueryClient
src/app/(tabs)/_layout.tsx               NativeTabs — 5 triggers, in this order
src/app/(tabs)/(home)/_layout.tsx        Stack
src/app/(tabs)/(home)/index.tsx          Home
src/app/(tabs)/(home)/about.tsx
src/app/(tabs)/(home)/skills.tsx
src/app/(tabs)/(home)/privacy.tsx
src/app/(tabs)/(home)/projects/index.tsx
src/app/(tabs)/(home)/projects/[slug].tsx
src/app/(tabs)/(blog)/_layout.tsx        Stack
src/app/(tabs)/(blog)/index.tsx
src/app/(tabs)/(blog)/[slug].tsx
src/app/(tabs)/(chat)/_layout.tsx        Stack
src/app/(tabs)/(chat)/index.tsx
src/app/(tabs)/(experience)/_layout.tsx  Stack
src/app/(tabs)/(experience)/index.tsx
src/app/(tabs)/(contact)/_layout.tsx     Stack
src/app/(tabs)/(contact)/index.tsx
src/app/+not-found.tsx
```

### `NativeTabs.Trigger` names (order fixed)

| Order | Trigger `name` | Label |
|---|---|---|
| 1 | `(home)` | Home |
| 2 | `(blog)` | Blogs |
| 3 | `(chat)` | Chat |
| 4 | `(experience)` | Experience |
| 5 | `(contact)` | Contact |

About, Projects, Project detail, Skills, and Privacy are **not** tabs — they push on the Home stack only.

---

## 2. Native-vs-web deltas (global)

| Web | Native |
|---|---|
| Hover border / opacity | Press opacity + `borderPressed` |
| Floating "Ask Mohamed" FAB (`ask-fab`) | **No FAB.** In-content `AskMohamedCTA` that switches to the Chat tab (optionally with `?q=`) |
| Next.js `<Link>` routes | Expo Router `router.push` / `<Link href>` |
| `next/image` | `expo-image` / `Image` with `require()` covers |
| MDX in the RSC tree | Bundled metadata + `GET /api/markdown` body (blog; projects optional) |
| Cookie session | `expo-secure-store` + `x-mg-session` (see API doc) |
| `sessionStorage` transcript cache | In-memory + server snapshot; optional AsyncStorage display cache without secrets |
| Navbar / Footer | Native tabs + stack headers |

---

## 3. Home stack

### 3.1 Home — `/(tabs)/(home)`

| | |
|---|---|
| **Route** | `/(tabs)/(home)/` → `index.tsx` |
| **Stack** | Home |
| **Deep link** | `/` · `moghaly://` · universal `https://<site>/` |

**Sections in render order** (from `features/home/index.tsx`):

1. **Hero** — name, animated roles, short bio, primary/ghost CTAs, social + contact icon row (`HeroSection`)
2. **StatsStrip** — compact stats
3. **FeaturedProjects** — featured project cards → push `projects/[slug]`
4. **LatestArticle** — latest published post → switch to Blogs stack or push blog slug
5. **SkillsHighlight** — top skill categories teaser → push `skills`
6. **AboutTeaser** → push `about`
7. **AskMohamedCTA** (`variant="banner"`) — suggested prompts → Chat tab with seed
8. **CTABanner** — contact / hire CTA → Contact tab

**Components:** ported home feature pieces + `Screen`, `Reveal`, `Button`, `Card`, `SectionLabel`, `PromptChip`, `Badge`.

**Data:** bundled `projects`, `skills`, `blog` (`getLatestPost`), `contact`, `EXPO_PUBLIC_*` social URLs.

**States:** no loading (static). Empty featured/latest: hide section. Error: N/A offline.

**Native delta:** Hero floating code block may simplify on small phones; keep brand name hero-level. No grayscale-hover on images — optional press opacity.

---

### 3.2 About — `/(tabs)/(home)/about`

| | |
|---|---|
| **Route** | `/(tabs)/(home)/about` |
| **Stack** | Home |
| **Deep link** | `/about` |

**Sections in render order** (`features/about/index.tsx`):

1. Header — `SectionLabel` "About Me" + title "The engineer behind the code."
2. Photo + bio column (avatar asset; four bio paragraphs; Get In Touch + Download CV buttons)
3. Skills summary — "What I work with." category → badge clouds from `skillCategories`
4. Links row — Work History (Experience tab), Projects, Full Skills List
5. `AskMohamedCTA` (`variant="compact"`)

**Data:** bundled skills + static copy; CV via `Linking` to site `/cv/mohamed-ghaly-cv.pdf` (or bundled asset if added later).

**States:** static. Missing avatar → letter/placeholder.

**Native delta:** Download CV opens system browser / share sheet; Get In Touch switches to Contact tab.

---

### 3.3 Projects index — `/(tabs)/(home)/projects`

| | |
|---|---|
| **Route** | `/(tabs)/(home)/projects` |
| **Stack** | Home |
| **Deep link** | `/projects` |

**Sections** (`features/projects/index.tsx`):

1. Header — label "Work", title "Projects", supporting sentence
2. Category filter (`ProjectFilter`) — "All" + unique categories
3. `ProjectGrid` — cards → `[slug]`

**Data:** bundled `projects` (10).

**States:** filter empty → empty copy "No projects in this category." No network.

**Native delta:** filter chips use press, not hover; horizontal chip scroll if needed.

---

### 3.4 Project detail — `/(tabs)/(home)/projects/[slug]`

| | |
|---|---|
| **Route** | `/(tabs)/(home)/projects/[slug]` |
| **Stack** | Home |
| **Deep link** | `/projects/<slug>` · universal link |

**Sections** (`app/(site)/projects/[slug]/page.tsx`):

1. Back — "← All Projects"
2. Header — category `Badge`, title, description
3. Meta row — Year, Company?, Status, Live / App Store / Play Store / GitHub links
4. Tags — `Badge` variant `code`
5. Body — case study: prefer `GET /api/markdown?path=/projects/<slug>` when online; airplane mode falls back to description (M3 Exit)

**Data:** `getProjectBySlug`; markdown client (M7/M8).

**States:** unknown slug → not-found. Loading markdown → `Skeleton`. Markdown error → description + retry.

**Native delta:** external store/GitHub links via `Linking.openURL`; share sheet on header action (M8).

---

### 3.5 Skills — `/(tabs)/(home)/skills`

| | |
|---|---|
| **Route** | `/(tabs)/(home)/skills` |
| **Stack** | Home |
| **Deep link** | `/skills` |

**Sections** (`features/skills/index.tsx`):

1. Header — "Toolkit" / "Skills & Technologies" + supporting sentence
2. Per-category `SkillCategory` blocks (5 categories)
3. `SoftSkillsSection`
4. `LanguagesSection`
5. `AskMohamedCTA` (`compact`)

**Data:** bundled `skills` (+ soft skills / languages from same module).

**States:** static.

---

### 3.6 Privacy — `/(tabs)/(home)/privacy`

| | |
|---|---|
| **Route** | `/(tabs)/(home)/privacy` |
| **Stack** | Home |
| **Deep link** | `/privacy` |

**Sections** (`features/privacy/index.tsx`):

1. Header + intro
2. What is collected and why
3. How long data is kept (retention table from `RETENTION_DAYS` — port constants or hardcode the published numbers: session 30, transcript 90, diagnostics 14, lead 365, audit 365)
4. Where this applies (GDPR baseline worldwide)
5. Who processes the data (Mohamed, OpenAI, Resend)
6. Request earlier deletion (mailto + Contact link)
7. Notice version footer

**Data:** retention constants; `CONTACT_EMAIL` / `CONTACT_MAILTO` from bundled contact. Notice version from env or draft API when chat is live.

**States:** static. Native copy should mention Secure Store session + optional push token once M9 ships.

**Native delta:** replace `sessionStorage` wording with "on-device display cache"; link Contact via tab switch.

---

## 4. Blogs stack

### 4.1 Blog index — `/(tabs)/(blog)`

| | |
|---|---|
| **Route** | `/(tabs)/(blog)/` |
| **Stack** | Blog |
| **Deep link** | `/blog` |

**Sections** (`features/blog/index.tsx`):

1. Header — "Writing" / "Blog" + supporting sentence
2. `BlogGrid` of published posts → `[slug]`

**Data:** `getPublishedPosts()` (currently 1).

**States:** zero published → empty copy. Static list (offline OK).

---

### 4.2 Blog article — `/(tabs)/(blog)/[slug]`

| | |
|---|---|
| **Route** | `/(tabs)/(blog)/[slug]` |
| **Stack** | Blog |
| **Deep link** | `/blog/<slug>` · universal link |

**Sections** (`app/(site)/blog/[slug]/page.tsx`):

1. Back — "← All Articles"
2. Title + excerpt
3. Meta — Published date, reading time?
4. Tags
5. Body — `GET /api/markdown?path=/blog/<slug>` (D8; requires M4 blog path extension)

**Data:** bundled post meta + network markdown.

**States:** unpublished / unknown → not-found. Loading → skeletons. Offline → meta visible, body error with retry. HTTP 404 markdown → local "Article unavailable."

---

## 5. Chat stack

### 5.1 Chat — `/(tabs)/(chat)`

| | |
|---|---|
| **Route** | `/(tabs)/(chat)/` |
| **Stack** | Chat |
| **Deep link** | `/chat` · `/chat?q=<seed>` · `moghaly://chat?q=` |

**Sections / regions** (`features/chat/*`):

1. Header — title, New chat, Privacy & help affordance → Home-stack Privacy
2. Body — welcome state **or** message list
   - Welcome: intro + `SuggestedPrompts` (`SUGGESTED_PROMPTS` from web config — port the eight strings)
   - Messages: user/assistant rows, markdown text, blocks (`project_grid`, `source_list`, `lead_form`, `contact_handoff`), stopped marker, stream status / tool label
3. Error notice — local copy only (error table in API doc)
4. Composer — text field, send / stop, composer notice string
5. Jump-to-latest (when scrolled up)

**Components:** ChatShell, ChatHeader, MessageList/Item, Composer, WelcomeState, StreamStatus, ErrorNotice, block components, LiveAnnouncer (a11y).

**Data:** network chat API + bundled projects/contact for block resolution (D7). Session in Secure Store.

**States:**

| State | UI |
|---|---|
| Boot loading | Welcome skeleton |
| Boot failed (no cache) | Retry panel |
| Degraded (cache only) | Banner + read-only or limited send |
| Streaming | Stream status + stop |
| Rate limited / blocked / network | ErrorNotice with mapped copy |
| Empty conversation | Welcome + prompts |

**Native delta:** full-height under NativeTabs (no web navbar offset); keyboard avoiding view; `expo/fetch` streaming (D5); stop always cancels server-side; poll while backgrounded generation with `AppState` (see API doc §f).

---

## 6. Experience stack

### 6.1 Experience — `/(tabs)/(experience)`

| | |
|---|---|
| **Route** | `/(tabs)/(experience)/` |
| **Stack** | Experience |
| **Deep link** | `/experience` |

**Sections** (`features/experience/index.tsx`):

1. Header — "Career" / "Work Experience" + supporting sentence
2. `Timeline` of experience items (3)
3. Education — label + "Academic background." + `EducationCard` grid (2)
4. Coursework — label + "Relevant Coursework." + `CourseCard` grid (5)
5. `AskMohamedCTA` (`compact`)

**Data:** bundled `experience`, `education`, `courses`.

**States:** static; airplane mode OK.

---

## 7. Contact stack

### 7.1 Contact — `/(tabs)/(contact)`

| | |
|---|---|
| **Route** | `/(tabs)/(contact)/` |
| **Stack** | Contact |
| **Deep link** | `/contact` |

**Sections** (`features/contact/index.tsx`):

1. Header — "Contact" / "Let's Work Together" + supporting sentence
2. `ContactForm` (name, email, subject?, message) → `POST /api/contact`
3. `ContactLinks` (email, phone, WhatsApp, social from env)
4. `AskMohamedCTA` (`inline`) → Chat tab

**Data:** form via network; links from bundled `contact.ts` + `EXPO_PUBLIC_*`.

**States:** submitting / success / field errors / server failure. Offline → disable submit + local network copy.

**Native delta:** no Origin needed (already works); use system keyboard types (`email-address`, etc.).

---

## 8. Not found

| | |
|---|---|
| **Route** | `+not-found.tsx` |
| **Deep link** | any unmatched path |

Brand `Screen` with title, short copy, button back to Home tab.

---

## 9. Deep-link map (M8)

| URL path | Destination |
|---|---|
| `/` | `(home)/` |
| `/about` | `(home)/about` |
| `/projects` | `(home)/projects` |
| `/projects/<slug>` | `(home)/projects/[slug]` |
| `/skills` | `(home)/skills` |
| `/privacy` | `(home)/privacy` |
| `/blog` | `(blog)/` |
| `/blog/<slug>` | `(blog)/[slug]` |
| `/chat` | `(chat)/` |
| `/chat?q=` | `(chat)/` with one-shot seed |
| `/experience` | `(experience)/` |
| `/contact` | `(contact)/` |

Custom scheme: `moghaly://` with the same path suffixes. Universal links require `apple-app-site-association` + `assetlinks.json` on the Next.js site (`public/.well-known/`).
