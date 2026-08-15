# Native companion app — content inventory

Verbatim transcription of portfolio data types, records, and screen copy from
`~/projects/my-portfolio`, so **M2** and **M3** can execute without opening the
web repo.

**Accuracy contract:** every type, field name, string literal, and record value
below is copied from source. Do not “improve” copy when porting. Snapshot date:
**2026-08-15**.

Cross-references: roadmap → [`00-roadmap.md`](./00-roadmap.md) (M2/M3); screens →
[`02-screens.md`](./02-screens.md); design system →
[`01-design-system.md`](./01-design-system.md); API →
[`03-api-contract.md`](./03-api-contract.md).

---

## 1. Type definitions

### `types/project.ts`

```ts
export type ProjectCategory = "mobile" | "frontend" | "backend" | "ai" | "other";

export interface ProjectImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface Project {
  slug: string;
  title: string;
  category: string;
  categories: ProjectCategory[];
  description: string;
  year: number;
  status: "Live" | "In Development" | "Archived";
  tags: string[];
  coverImage?: ProjectImage;
  liveUrl?: string;
  githubUrl?: string;
  playstoreUrl?: string;
  appstoreUrl?: string;
  featured?: boolean;
  company?: string;
}
```

### `types/blog.ts`

```ts
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  published: boolean;
  readingTime?: string;
}
```

### `types/skill.ts`

```ts
export type SkillLevel = "Expert" | "Proficient" | "Familiar";

export interface Skill {
  name: string;
  level?: SkillLevel;
}

export interface SkillCategory {
  category: string;
  skills: Skill[];
}
```

### `types/education.ts`

```ts
export interface EducationItem {
  institution: string;
  degree: string;
  period: string;
  location: string;
  description?: string;
  tags?: string[];
}
```

### `types/course.ts`

```ts
export interface CourseItem {
  name: string;
  provider: string;
  year?: string;
  certificateUrl?: string;
}
```

### `ExperienceItem` (inline in `lib/data/experience.ts`)

**Not** under `types/`. M2 extracts this into `src/types/experience.ts` (or
equivalent) when porting.

```ts
export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  location: string;
  description: string;
  tags: string[];
  current?: boolean;
}
```

### `languages` in `lib/data/skills.ts`

Exported as an untyped array literal:

```ts
export const languages = [
  { name: "Arabic", level: "Native" },
  { name: "English", level: "Professional Working Proficiency" },
];
```

`"Native"` and `"Professional Working Proficiency"` are **not** valid
`SkillLevel` values (`"Expert" | "Proficient" | "Familiar"`). **M2 typing:**
introduce a separate type, e.g.

```ts
export type LanguageProficiency =
  | "Native"
  | "Professional Working Proficiency";

export interface LanguageItem {
  name: string;
  level: LanguageProficiency;
}
```

Do not coerce languages into `Skill`.

---

## 2. Projects (`lib/data/projects.ts`)

**Count:** 10 records, source order below.

**Featured (3):** `orth-app`, `vimi-app`, `aydi-business`.

**With `coverImage` (5):**

| Slug | `src` | `width`×`height` | `alt` |
|---|---|---|---|
| `orth-app` | `/projects/orth.webp` | 400×400 | ORTH agronomy assistant mobile app interface |
| `vimi-app` | `/projects/vimi.webp` | 400×400 | VIMI e-commerce mobile app storefront interface |
| `meshwarak-app` | `/projects/meshwarak.webp` | 400×400 | Meshwarak ride comparison mobile app interface |
| `aydi-field-app` | `/projects/aydi-field.webp` | 480×480 | Aydi Field mobile app for agricultural field operations |
| `aydi-business` | `/projects/aydi-business.webp` | 400×400 | Aydi Business mobile operations dashboard interface |

**No cover and no URLs:** `sagar-app` (no `coverImage`, no `liveUrl` / `githubUrl` /
`playstoreUrl` / `appstoreUrl`). Letter fallback uses `project.title.charAt(0)`.

### 2.1 `orth-app`

- **slug:** `orth-app`
- **title:** `ORTH App`
- **category:** `Mobile App`
- **categories:** `["mobile", "ai"]`
- **description:** `AI-powered agronomy assistant with real-time streaming responses, audio playback, and clean architecture.`
- **year:** `2025`
- **status:** `Live`
- **tags:** `["Flutter", "Socket.IO", "Clean Architecture", "Cubit", "Freezed"]`
- **featured:** `true`
- **coverImage:** present (see table)
- **appstoreUrl:** `https://apps.apple.com/us/app/orth/id6754557886`
- **playstoreUrl:** `https://play.google.com/store/apps/details?id=com.aydi.orth.app`
- **company:** `Aydi Technologies`
- **absent:** `liveUrl`, `githubUrl`

### 2.2 `vimi-app`

- **slug:** `vimi-app`
- **title:** `VIMI App`
- **category:** `Mobile App`
- **categories:** `["mobile"]`
- **description:** `Full-featured e-commerce app with dual-role access — shoppers browse and order, while admins manage the entire store from a dedicated mobile dashboard.`
- **year:** `2023`
- **status:** `Live`
- **tags:** `["Flutter", "BLoC", "Clean Architecture", "E-Commerce", "Multi-Role"]`
- **featured:** `true`
- **coverImage:** present
- **appstoreUrl:** `https://apps.apple.com/eg/app/vimi-store/id6740061265`
- **company:** `Freelance`
- **absent:** `liveUrl`, `githubUrl`, `playstoreUrl`

### 2.3 `meshwarak-app`

- **slug:** `meshwarak-app`
- **title:** `Meshwarak App`
- **category:** `Mobile App`
- **categories:** `["mobile"]`
- **description:** `Stop searching and start your journey with Meshwarak, the app that brings you the best ride offers from different ride-hailing companies in one place!`
- **year:** `2024`
- **status:** `Live`
- **tags:** `["Flutter", "Bloc/Cubit", "Clean Architecture"]`
- **featured:** `false`
- **coverImage:** present
- **appstoreUrl:** `https://apps.apple.com/eg/app/meshwarak-%D9%85%D8%B4%D9%88%D8%A7%D8%B1%D9%83/id6450388462`
- **company:** `Freelance`
- **absent:** `liveUrl`, `githubUrl`, `playstoreUrl`

### 2.4 `aydi-field-app`

- **slug:** `aydi-field-app`
- **title:** `Aydi Field App`
- **category:** `Mobile App`
- **categories:** `["mobile"]`
- **description:** `Simplify your field operations and record-keeping. Built with an offline-first architecture so field workers stay productive with or without connectivity.`
- **year:** `2023`
- **status:** `Live`
- **tags:** `["Flutter", "GetX", "SQLite", "Offline-First", "REST APIs", "Clean Architecture", "Multi-Role"]`
- **featured:** `false`
- **coverImage:** present (480×480)
- **playstoreUrl:** `https://play.google.com/store/apps/details?id=com.aydi.field.app`
- **company:** `Aydi Technologies`
- **absent:** `liveUrl`, `githubUrl`, `appstoreUrl`

### 2.5 `aydi-business`

- **slug:** `aydi-business`
- **title:** `Aydi Business`
- **category:** `Mobile App`
- **categories:** `["mobile"]`
- **description:** `The essential software solution to streamline your field operations and enable you to effortlessly control your costs, resources and data.`
- **year:** `2022`
- **status:** `Live`
- **tags:** `["Flutter", "Bloc/Cubit", "REST APIs", "Clean Architecture", "Multi-Role"]`
- **featured:** `true`
- **coverImage:** present
- **playstoreUrl:** `https://play.google.com/store/apps/details?id=com.aydi.business.app`
- **appstoreUrl:** `https://apps.apple.com/eg/app/aydi-business/id6443989185`
- **company:** `Aydi Technologies`
- **absent:** `liveUrl`, `githubUrl`

### 2.6 `sagar-app`

- **slug:** `sagar-app`
- **title:** `Sagar App`
- **category:** `Mobile App`
- **categories:** `["mobile"]`
- **description:** `Real-time chat application with instant messaging, built on Socket.IO for live communication and React Query for efficient data synchronization.`
- **year:** `2023`
- **status:** `Live`
- **tags:** `["React Native", "Socket.IO", "React Query", "Real-time"]`
- **featured:** `false`
- **company:** `WhyNotTech`
- **absent:** `coverImage`, `liveUrl`, `githubUrl`, `playstoreUrl`, `appstoreUrl`

### 2.7 `aydi-eye`

- **slug:** `aydi-eye`
- **title:** `Aydi Eye`
- **category:** `Web App`
- **categories:** `["frontend"]`
- **description:** `Company portal for Aydi Eye — contributed to feature development, bug fixes, and performance optimization using React, Next.js, and React Query.`
- **year:** `2023`
- **status:** `Live`
- **tags:** `["React", "Next.js", "React Query", "TypeScript"]`
- **featured:** `false`
- **liveUrl:** `https://eye.aydi.com/`
- **company:** `Aydi Technologies`
- **absent:** `coverImage`, `githubUrl`, `playstoreUrl`, `appstoreUrl`

### 2.8 `aydi-admin-dashboard`

- **slug:** `aydi-admin-dashboard`
- **title:** `Aydi Admin Dashboard`
- **category:** `Web App`
- **categories:** `["frontend"]`
- **description:** `Admin dashboard built with React and Next.js. Collaborated with PMs and UI/UX teams to deliver reusable components and server-side authentication for enhanced security.`
- **year:** `2022`
- **status:** `Live`
- **tags:** `["React", "Next.js", "TypeScript", "Authentication"]`
- **featured:** `false`
- **liveUrl:** `https://admin.aydi.com/`
- **company:** `Aydi Technologies`
- **absent:** `coverImage`, `githubUrl`, `playstoreUrl`, `appstoreUrl`

### 2.9 `vts-website`

- **slug:** `vts-website`
- **title:** `VTS Website`
- **category:** `Web App`
- **categories:** `["frontend", "backend"]`
- **description:** `Redesigned VTS's website with localization support, user-centric design, and a contact form backed by Node.js and MongoDB.`
- **year:** `2021`
- **status:** `Live`
- **tags:** `["React", "Node.js", "MongoDB", "Localization"]`
- **featured:** `false`
- **liveUrl:** `https://visionalization.com/`
- **company:** `VTS`
- **absent:** `coverImage`, `githubUrl`, `playstoreUrl`, `appstoreUrl`

### 2.10 `ghadan-website`

- **slug:** `ghadan-website`
- **title:** `Ghadan Website`
- **category:** `Web App`
- **categories:** `["frontend"]`
- **description:** `Led the redesign of the Ghadan company website, delivering an updated and engaging user experience.`
- **year:** `2020`
- **status:** `Live`
- **tags:** `["React"]`
- **featured:** `false`
- **liveUrl:** `https://ghadan.co/`
- **company:** `VTS`
- **absent:** `coverImage`, `githubUrl`, `playstoreUrl`, `appstoreUrl`

### Helpers

```ts
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}
```

---

## 3. Blog (`lib/data/blog.ts`)

### Record (1)

| Field | Value |
|---|---|
| `slug` | `flutter-socketio-streaming` |
| `title` | `How I built real-time AI streaming in Flutter with Socket.IO` |
| `date` | `2026-04-02` |
| `tags` | `["Flutter", "Socket.IO", "AI", "Streaming"]` |
| `excerpt` | `A deep-dive into how ORTH streams AI-generated tokens in real time to a Flutter UI using Socket.IO and StreamController.` |
| `published` | `true` |
| `readingTime` | **absent** (optional field unused) |

### Helpers

```ts
export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getPublishedPosts(): BlogPost[] {
  return posts.filter((p) => p.published);
}

export function getLatestPost(): BlogPost | undefined {
  return getPublishedPosts().sort((a, b) => b.date.localeCompare(a.date))[0];
}
```

**Sort rule:** `localeCompare` on `date` descending (`b` vs `a`); first element after sort.

### MDX is body-only

Project and blog MDX files carry **no frontmatter**. All metadata lives in
`lib/data/`; MDX is prose only.

**Representative project case study headings** (`content/projects/orth-app.mdx`):

- `## Overview`
- `## The Challenge`
- `## My Role`
- `## Architecture & Technical Decisions`
  - `### State Management → Cubit + Freezed`
  - `### Real-time AI Streaming → Socket.IO + StreamController`
  - `### Audio Playback — Lifecycle & Interruption Management`
- `## Key Features`
- `## Results`

**Blog article headings** (`content/blog/flutter-socketio-streaming.mdx`):

- `## The Problem`
- `## Why Socket.IO over raw WebSockets`
- `## Wiring the socket to a StreamController`
- `## State management with Cubit + Freezed`
- `## Handling interruptions and lifecycle`
- `## Results`

---

## 4. Skills, soft skills, languages (`lib/data/skills.ts`)

Verified counts from source: **Mobile 6**, **Frontend 9**, **Backend 7**,
**Architecture 4**, **Tools & AI 6** — **total 32**.

### Mobile (6)

| Name | Level |
|---|---|
| Flutter | Expert |
| Dart | Expert |
| React Native | Proficient |
| GetX | Proficient |
| Bloc / Cubit | Expert |
| Cross-Platform | Expert |

### Frontend (9)

| Name | Level |
|---|---|
| React | Expert |
| Next.js | Expert |
| TypeScript | Expert |
| JavaScript | Expert |
| HTML5 | Expert |
| CSS3 | Expert |
| Tailwind CSS | Expert |
| Bootstrap | Proficient |
| Redux / Zustand | Proficient |

### Backend (7)

| Name | Level |
|---|---|
| Node.js | Proficient |
| Express.js | Proficient |
| NestJS | Proficient |
| MongoDB | Proficient |
| Socket.IO | Proficient |
| RESTful APIs | Expert |
| Firebase | Proficient |

### Architecture (4)

| Name | Level |
|---|---|
| Clean Architecture | Expert |
| OOP / SOLID | Expert |
| Freezed | Expert |
| GetIt | Proficient |

### Tools & AI (6)

| Name | Level |
|---|---|
| Git & GitHub | Expert |
| Claude Code | Expert |
| Cursor | Expert |
| Codex | Expert |
| Unit Testing | Proficient |
| Docker | Familiar |

### Soft skills (6), source order

1. `Ability to wear many hats and learn new technologies quickly`
2. `Creative Problem Solving`
3. `Time Management`
4. `Attention to Details`
5. `Team Player`
6. `Self-learner`

### Languages (2)

| Name | Level |
|---|---|
| Arabic | Native |
| English | Professional Working Proficiency |

---

## 5. Experience, education, courses

### Experience (3 active; 2 commented-out VTS entries excluded)

#### 1 — Aydi Technologies (`current: true`)

- **company:** `Aydi Technologies`
- **role:** `Flutter & Frontend Engineer`
- **period:** `2022 — Present`
- **location:** `Cairo, Egypt (Remote)`
- **description:** `Building ORTH — an AI agronomy assistant — with Flutter, real-time Socket.IO streaming, and clean architecture. Also contributing to the Next.js + NestJS web platform.`
- **tags:** `["Flutter", "Socket.IO", "Next.js", "Clean Architecture", "Cubit"]`
- **current:** `true`

#### 2 — NasNav

- **company:** `NasNav`
- **role:** `Frontend Developer`
- **period:** `Jul 2021 — Dec 2021`
- **location:** `Cairo, Egypt (Remote)`
- **description:** `Contributed to the Yeshtery e-commerce web app with a pixel-perfect, responsive UI. Implemented REST API integrations and collaborated on authentication and authorization flows.`
- **tags:** `["React", "JavaScript", "REST APIs"]`
- **current:** absent

#### 3 — VTS

- **company:** `VTS`
- **role:** `Frontend Developer`
- **period:** `Jan 2021 - Jun 2021`
- **location:** `Egypt`
- **description:** `Built a vehicle tracking system integrating Angular with IoT data. Led website redesign work in React, improved UX, and added localization support across multiple company sites.`
- **tags:** `["Angular", "React", "IoT", "Localization"]`
- **current:** absent

**Commented out in source (do not port into the active array):**

1. VTS · Frontend Developer · `Apr 2020 - Aug 2020`
2. VTS · Frontend Web Developer (Internship) · `Jan 2020 - Mar 2020`

### Education (2)

#### 1

- **institution:** `Information Technology Institute (ITI)`
- **degree:** `Intensive Training Program — MEARN Stack`
- **period:** `Sept. 2020 – Dec. 2020`
- **location:** `Mansoura University, Egypt`

#### 2

- **institution:** `Higher Institute of Engineering and Technology`
- **degree:** `Bachelor of Engineering`
- **period:** `2014 – 2019`
- **location:** `New Damietta, Egypt`

### Courses (5)

| name | provider | year | certificateUrl |
|---|---|---|---|
| Full-Stack Web Development Diploma | Route | `2020` | commented out in source — treat as absent |
| JavaScript – The Complete Guide (Beginner + Advanced) | Academind | absent | absent |
| React – The Complete Guide (Hooks, React Router + Redux) | Academind | absent | absent |
| React, Nodejs, Express & MongoDB – The MERN Full Stack Guide | Academind | absent | absent |
| React Native – The Practical Guide | Academind | absent | absent |

UI label when `certificateUrl` is set: `View Certificate →` (`CourseCard`). Currently
no active course has a live `certificateUrl`, so that link never renders.

---

## 6. Contact constants (`lib/data/contact.ts`)

| Export | Value / derivation |
|---|---|
| `CONTACT_EMAIL` | `"mohamedghaly.dev@gmail.com"` |
| `CONTACT_PHONE` | `"+201146976336"` |
| `CONTACT_WHATSAPP` | `` `https://wa.me/${CONTACT_PHONE.replace("+", "")}` `` → `https://wa.me/201146976336` |
| `CONTACT_MAILTO` | `` `mailto:${CONTACT_EMAIL}` `` → `mailto:mohamedghaly.dev@gmail.com` |
| `CONTACT_TEL` | `` `tel:${CONTACT_PHONE}` `` → `tel:+201146976336` |

---

## 7. Site constants (`lib/seo/site.ts`)

```ts
export const SITE_NAME = "Mohamed Ghaly";

export const SITE_TAGLINE = "Flutter & Frontend Engineer";

export const DEFAULT_DESCRIPTION =
  "Flutter & Frontend Engineer with 5+ years shipping production mobile apps and React / Next.js web apps. Clean architecture, real-time features. Based in Egypt, available remote.";
```

### `getSiteUrl()` fallback chain

1. `process.env.NEXT_PUBLIC_SITE_URL` with trailing `/` stripped, if set
2. else if `process.env.VERCEL_URL` → `` `https://${process.env.VERCEL_URL}` ``
3. else `"https://moghaly.dev"`

**Drift risk:** `lib/seo/page-meta.ts` hardcodes
`email: "mohamedghaly.dev@gmail.com"` on the Person JSON-LD instead of importing
`CONTACT_EMAIL`. Keep both in sync manually if either changes.

---

## 8. Screen copy, per screen

Strings are verbatim from the cited source files. JSX `&apos;` / `&amp;` decode
to the characters visitors see (`'`, `&`).

### 8.1 Home

**Hero** (`features/home/components/HeroSection.tsx`)

- Eyebrow: `Hey there, I'm`
- Name (h1): `Mohamed Ghaly.`
- Rotating roles (`ROLES`, cycles via `AnimatedText`):
  1. `Flutter Developer`
  2. `Frontend Engineer`
  3. `Mobile Specialist`
  4. `UI/UX Enthusiast`
- Pitch: `I build cross-platform mobile apps and high-performance web interfaces. Focused on clean architecture, real-time features, and developer experience that scales.`
- Primary button: `View My Work →`
- Ghost button: `Download CV ↓`
- Social icon `aria-label`s (icons only): `GitHub`, `LinkedIn`, `YouTube`, `Email`, `Phone`, `WhatsApp` — GitHub/LinkedIn/YouTube render only when `NEXT_PUBLIC_*` URLs are configured HTTP(S).
- Floating code block (lg+): comment `// Real-time AI streaming` plus `OrthService` / `StreamController` demo code (decorative).

**StatsStrip** (`StatsStrip.tsx`)

| Value | Label |
|---|---|
| `5+` | `Years Exp` |
| `3+` | `Tech Stacks` |
| `10+` | `Live Apps` |
| `∞` | `Lines Shipped` |

**FeaturedProjects**

- SectionLabel: `Selected Work`
- Title: `Things I've built.`
- Placeholder card (when fewer than 3 featured): `Coming Soon`
- CTA: `View All Projects →`
- Per card footer (`ProjectCard`): `Case Study →`; company prefix `@ {company}` when set

**LatestArticle**

- **Conditional:** entire section returns `null` when `getLatestPost()` is undefined.
- SectionLabel: `Latest Writing`
- Title: `From the blog.`
- CTA: `Read More Articles →`
- Card link (`BlogPostCard`): `Read Article →`

**SkillsHighlight**

- SectionLabel: `Toolkit`
- Title: `The tools I use to build things.`
- Category headings: data-driven (`Mobile`, `Frontend`, …)

**AboutTeaser**

- SectionLabel: `About Me`
- Title: `The engineer behind the code.`
- Para 1: `I'm a Flutter & Frontend Engineer with 5+ years of experience building production-grade mobile apps and web interfaces. I care deeply about clean architecture, developer experience, and shipping things that actually work.`
- Para 2: `My work spans real-time AI streaming apps, cross-platform mobile products, and complex frontend systems. I lean on Clean Architecture, Bloc/Cubit, and strong typing to keep codebases maintainable as they scale.`
- Para 3: `When I'm not building, I'm learning — exploring new tooling, contributing to the Flutter ecosystem, and occasionally shipping side projects that scratch my own itches.`
- Link: `→ More About Me`
- Image alt: `Mohamed Ghaly`

**AskMohamedCTA** (`variant="banner"` on Home)

- SectionLabel: `Ask Mohamed`
- Title: `Curious about my work?`
- Body: `Ask Mo Ghaly GPT about my experience, projects, or approach to building production software.`
- Button: `Ask Mo Ghaly GPT →`
- Starter chips: first **4** of `SUGGESTED_PROMPTS` (§8.11); index ≥ 3 hidden below `sm`

**CTABanner**

- SectionLabel: `Let's Work Together`
- Title: `Got a project in mind?`
- Body: `I'm open to freelance, contract, and full-time opportunities. Let's build something great together.`
- Primary: `Let's Talk →`
- Ghost: `View Resume ↓`

### 8.2 About (`features/about/index.tsx`)

- SectionLabel: `About Me`
- h1: `The engineer behind the code.`
- Bio paragraphs (full):
  1. `I'm Mohamed Ghaly — a Flutter & Frontend Engineer based in Egypt with 5+ years of experience building production-grade mobile apps and web interfaces. I care deeply about clean architecture, developer experience, and shipping things that actually work in the real world.`
  2. `My work spans real-time AI streaming mobile apps, cross-platform products used by thousands of users, and complex frontend systems. I lean heavily on Clean Architecture, Bloc/Cubit, and strong typing to keep codebases maintainable as they scale. I believe code is a communication tool — it should be as clear to the next engineer as it is to the compiler.`
  3. `When I'm not building, I'm learning — exploring new tooling, contributing to the Flutter ecosystem, running a YouTube channel on mobile development, and occasionally shipping side projects that scratch my own itches.`
  4. `Currently open to senior Flutter / frontend roles and interesting freelance projects. Based in Egypt, available remotely worldwide.`
- Buttons: `Get In Touch →` · `Download CV ↓`
- Skills heading: `What I work with.`
- Link row: `→ Work History` · `→ Projects` · `→ Full Skills List`
- Then `AskMohamedCTA` compact (§8.11)

### 8.3 Projects index

- SectionLabel: `Work`
- h1: `Projects`
- Supporting: `A selection of apps and products I've shipped. Click any card for the full case study.`
- Filter: `All` plus unique `project.category` values from data → currently `Mobile App`, `Web App`
- Empty (`ProjectGrid`): `No projects in this category yet.`
- Card link: `Case Study →`

### 8.4 Project detail (`app/(site)/projects/[slug]/page.tsx`)

- Back: `← All Projects`
- Meta row labels (in render order; items after Year are conditional):
  1. `Year` (always)
  2. `Company` (if `project.company`)
  3. `Status` (always)
  4. `Live` → link text `View Site →` (if `liveUrl`)
  5. `App Store` → `Download →` (if `appstoreUrl`)
  6. `Play Store` → `Download →` (if `playstoreUrl`)
  7. `Source` → `GitHub →` (if `githubUrl`)

### 8.5 Skills

- SectionLabel: `Toolkit`
- h1: `Skills & Technologies`
- Supporting: `Tools I reach for in production. No fake progress bars — just honest categorisation with experience level.`
- Section headings: category names from data; then `Soft Skills`; then `Languages`
- Then `AskMohamedCTA` compact

### 8.6 Experience

- SectionLabel: `Career`
- h1: `Work Experience`
- Supporting: `A timeline of the companies and teams I've built products with.`
- Education SectionLabel: `Education`
- Education h2: `Academic background.`
- Learning SectionLabel: `Learning`
- Coursework h2: `Relevant Coursework.`
- Certificate link label (when URL present): `View Certificate →`
- Note: `current` is visual only on the timeline spine (filled accent dot); **no** “Current” text badge in `TimelineItem`.
- Then `AskMohamedCTA` compact

### 8.7 Blog index & article

**Index**

- SectionLabel: `Writing`
- h1: `Blog`
- Supporting: `Notes on real-time systems, Flutter, and web engineering — written from shipped products, not slides.`
- Empty (`BlogGrid`): `No articles published yet.`
- Card: date, title, excerpt, tags (≤4), `Read Article →`

**Article**

- Back: `← All Articles`
- Meta labels: `Published` · `Read time` (only if `post.readingTime` — currently unused on the only post)

### 8.8 Contact

**Header** (`features/contact/index.tsx`)

- SectionLabel: `Contact`
- h1: `Let's Work Together`
- Supporting: `Open to senior Flutter / frontend roles, freelance contracts, and interesting collaborations. I respond within 24 hours.`

**Form** (`ContactForm.tsx`)

| Field | Label | Placeholder |
|---|---|---|
| name | `Name` | `Your name` |
| email | `Email` | `you@example.com` |
| subject | `Subject (optional)` — visible as `Subject` + `(optional)` in lowercase span | `What is this about?` |
| message | `Message` | `Your message` |

- Submit idle: `Send Message →`
- Submit pending: `Sending...`
- Success: `Message sent!`
- Error (server action): `Failed to send email. Please try again.`
- Validation messages come from Zod (`contactSchema`): e.g. `Name must be at least 2 characters`, `Please enter a valid email address`, `Message must be at least 10 characters`

**ContactLinks**

| Label | Value shown |
|---|---|
| `Email` | `mohamedghaly.dev@gmail.com` |
| `Phone` | `+201146976336` |
| `WhatsApp` | `+201146976336` (same phone string; href is WhatsApp URL) |
| `Location` | `Egypt — Available Remotely` |
| `Status` | `Open to opportunities` |

Then social icon row (same pattern as hero). Then `AskMohamedCTA` inline:
`Not ready to send a message?` + `→ Or ask Mo Ghaly GPT first`

### 8.9 Privacy (`features/privacy/index.tsx`)

Section headings in order:

1. Page SectionLabel: `Privacy`
2. h1: `What Mo Ghaly GPT collects — and for how long.`
3. Intro paragraph (full): `This notice covers the public chat on this site, lead forms submitted through it, and the admin tooling used to review those leads. Portfolio pages themselves do not require an account and do not store personal messages.`
4. `What is collected and why`
5. `How long data is kept` (table caption sr-only: `Retention periods for Mo Ghaly GPT data categories`; column headers `Data` / `Retention`)
6. `Where this applies`
7. `Who processes the data`
8. `Request earlier deletion`
9. Footer format: `Last updated · notice version {noticeVersion}`

Retention row labels: `Anonymous session`, `Non-lead chat transcript`, `Failed request diagnostics`, `Lead and consent record`, `Admin audit log`. Extra line: `Rate-limit counters and related IP hashes are kept for 24 hours or less.`

### 8.10 Chat

From components + `lib/chat/config.ts` (constants noted).

**Header** (`ChatHeader.tsx`)

- Title: `Mo Ghaly GPT`
- Badge: `AI representative` (`AI_IDENTITY_BADGE`)
- Subtitle: `Ask about Mohamed's work, experience, and project fit.`
- Buttons: `Privacy & help` · `New chat`
- Privacy dialog title/intro/details: see `CHAT_PRIVACY_NOTICE` below
- Dialog link: `Read the full privacy notice`
- Dialog dismiss: `Got it`
- Close control `aria-label`: `Close privacy and help`

**Welcome** (`WelcomeState.tsx`)

> Hi — I'm Mo Ghaly GPT, Mohamed Ghaly's AI representative. I can answer questions about his frontend and mobile engineering experience, explain relevant projects, and help you decide whether his background may fit your role or product.

Welcome shows first **6** of `SUGGESTED_PROMPTS` (indices ≥ 4 hidden below `sm`).

**Composer**

- sr-only label: `Message Mo Ghaly GPT`
- Placeholder: `Ask about Mohamed's work`
- Send `aria-label`: `Send message`
- Stop `aria-label`: `Stop generating`
- Helper (`COMPOSER_NOTICE`): `AI can make mistakes. For commitments or private details, contact Mohamed directly.`
- Counter when length > 90% of max: `{n}/4000`

### 8.11 Chat config constants (`lib/chat/config.ts`)

```ts
export const MESSAGE_MAX_LENGTH = 4_000;

export const SUGGESTED_PROMPTS = [
  "What does Mohamed specialize in?",
  "Tell me about his Flutter production experience.",
  "Show me relevant mobile and frontend projects.",
  "How does Mohamed approach software architecture?",
  "Could his background fit my project?",
  "I am hiring for a frontend or mobile role.",
  "How does he use AI in software development?",
  "I want to contact Mohamed.",
] as const;

export const COMPOSER_NOTICE =
  "AI can make mistakes. For commitments or private details, contact Mohamed directly.";

export const CHAT_PRIVACY_NOTICE = {
  title: "Privacy & help",
  introduction: "Here is what happens when you use this chat:",
  details: [
    "Messages are stored for conversation continuity and may also be cached in this browser's session storage.",
    "Messages and recent chat history are processed by OpenAI to generate replies. Requests use store: false, so OpenAI response storage is disabled.",
    "Conversations are not used for training.",
    "Non-lead chat transcripts are kept for 90 days, then deleted; anonymous sessions expire after 30 days of inactivity. This applies to every visitor, regardless of location.",
    "You can request earlier deletion of your conversation at any time by contacting Mohamed directly.",
    "Do not share passwords, API keys, private source code, or other sensitive information.",
  ],
  moreLink: "/privacy",
} as const;

export const AI_IDENTITY_BADGE = "AI representative";
```

**AskMohamedCTA compact** (About / Skills / Experience): SectionLabel `Ask Mohamed`; title `Have a question about my work?`; body `Mo Ghaly GPT can answer questions about my experience, projects, and engineering approach.`; button `Ask Mo Ghaly GPT →`; 3 prompt chips.

### 8.12 Not found (`app/not-found.tsx`)

- Giant numeral: `404`
- h1: `Page not found.`
- Body: `That route doesn't exist — it was either moved, deleted, or never shipped.`
- Terminal title: `stack_trace.log`
- Fake stack lines:
  - `Exception: RouteNotFoundException`
  - `  at Router.resolve (navigation.dart:42)`
  - `  at Navigator.push (navigator.dart:118)`
  - `  at UserTap.handle (you.dart:1)`
  - (blank)
  - `→ path not found: the page you requested does not exist.`
- Buttons: `← Back to Home` · `View Projects`
- Quick nav: `About →` · `Skills →` · `Experience →` · `Contact →`

### 8.13 Navbar / MobileMenu / Footer

**Navbar + MobileMenu nav order** (same labels; MobileMenu numbers `01`…`07`):

1. About  
2. Projects  
3. Blog  
4. Skills  
5. Experience  
6. Chat  
7. Contact  

- Logo: `{ M.Ghaly }` (accent braces, text ` M.Ghaly ` with spaces)
- CTA: `Hire Me`
- Mobile open/close `aria-label`s: `Open menu` / `Close menu`

**Footer**

- Brand: `MG.dev`
- Copyright: `© 2026 Mohamed Ghaly`
- Footer nav order: Home · About · Projects · Blog · Skills · Experience · Chat · Contact · Privacy

**What survives into the app**

| Web chrome | Native fate |
|---|---|
| Five tabs (Home / Blogs / Chat / Experience / Contact) | NativeTabs labels |
| About / Projects / Skills / Privacy | Home stack routes + stack titles |
| `{ M.Ghaly }` / `MG.dev` / Hire Me / full nav / footer | **Do not** ship as web chrome; optional brand mark in splash / about only |
| Floating Ask Mohamed FAB | **Dropped** — in-content CTA only |

---

## 9. Sync rule

`~/projects/my-portfolio/lib/data/` remains the **source of truth** (roadmap **D2**).
This document is a **snapshot** (2026-08-15) so M2/M3 can run offline against
frozen copy. After the port, `scripts/sync-content.ts` (copy + rewrite `@/`
imports) is what keeps `src/data/` honest — re-run it when the web data changes,
then update this inventory or regenerate it from source.
