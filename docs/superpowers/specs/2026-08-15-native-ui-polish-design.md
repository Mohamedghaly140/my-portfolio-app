# Native UI polish — design

Status: approved for implementation. Author: Claude (brainstorming session with Mohamed Ghaly), 2026-08-15.

## Problem

The M3 screens (Home, About, Projects, Project detail, Skills, Experience, Privacy) render correctly and follow the documented design tokens, but read as a mobile-web view of the portfolio site rather than a native app. The brand itself (square corners, mono type, hairline borders, dark-mint palette — D3/D4 in `01-design-system.md`) is not the cause and stays fixed. The cause is:

- Plain `Stack.Screen` headers with no large-title/blur scroll behavior — a flat title bar, same on every screen.
- Web-idiom components ported literally: `StatsStrip` is a shared-border CSS grid box; `ProjectCard`'s "Case Study →" footer is a text link mimicking an `<a>`; `Button` labels embed unicode arrows (`→`, `↓`) as literal characters instead of real icons; empty/placeholder states use dashed borders (a wireframe/web convention).
- No native micro-interactions: no haptics, no pull-to-refresh anywhere.

Blog, Chat, and Contact tabs are still M0 placeholders (M5–M7, not yet built) and are out of scope here.

## Scope decisions (from brainstorming)

- **Brand fixed.** No change to corner radius, type families, palette, or the hairline-not-shadow visual language.
- **Priority: native chrome & navigation first**, then shared-component affordances. Screen-level information architecture / section order (`02-screens.md`) is explicitly **not** touched in this pass — that's a separate, bigger decision if ever pursued.
- **No specific reference app** — target idiomatic iOS HIG / Material conventions, kept restrained/editorial to match the existing brand.
- No new dependencies: `expo-haptics` and `@expo/vector-icons` are already in the tree.

## 1. Navigation chrome

- **Root tab screens** (the `index` screen inside each of `(home)`, `(blog)`, `(chat)`, `(experience)`, `(contact)`): `headerLargeTitle: true`, `headerTransparent: true`, `headerBlurEffect` (matching color scheme) on **iOS only** — title starts large, collapses into a small blurred sticky bar on scroll. `react-native-screens`' large-title support is iOS-only; **Android** gets a standard flat Material app bar in `colors.bg` rather than a hand-rolled collapsing-title imitation.
- **Pushed screens** (About, Skills, Privacy, Projects index, Project detail, dev gallery): standard (non-large) title, opaque `colors.bg` background, system back button/gesture (already free via `react-native-screens`).
- Header title font uses brand type, not the system font: `headerLargeTitleStyle` / `headerTitleStyle: { fontFamily: FontFamilies.displayBold }`.
- `headerShadowVisible: false` everywhere; tint (back button / large-title accent, where applicable) = `colors.accentText`. No header shadow — hairline-not-shadow stays consistent with the rest of the design system.
- Applies per-`_layout.tsx` via `Stack.Screen options`; each of the five tab stacks gets this treatment on its root screen, `(home)`'s pushed screens get the standard variant.

## 2. Micro-interactions & affordances

- **`Button` icon slot.** New optional prop, e.g. `icon?: { name: keyof typeof Ionicons.glyphMap; position?: 'leading' | 'trailing' }` (exact icon set/name TBD at implementation time — use `Ionicons` from `@expo/vector-icons` for consistency with existing tab icons). Rendered adjacent to the label, sized/colored to match the label's type role and color. Callers drop the arrow character from the label string and pass `icon` instead (e.g. `label="View My Work"` + `icon={{ name: 'arrow-forward' }}`).
- **Haptics.** New `src/lib/haptics.ts` wrapping `expo-haptics` (one place to adjust/no-op later, e.g. for web). Light impact haptic on `Button` **primary** variant press only (ghost/text buttons stay silent). Selection haptic on `ProjectCard` press (and other card-style navigations as they're built).
- **`ProjectCard` affordance.** Replace the "Case Study →" text-link footer with a trailing chevron (`chevron-forward`, `accentText`) pinned bottom-right of the card — signals "this pushes" the way a native list/card row does, without relying on link-style text.
- **Pull-to-refresh.** `Screen` gains optional `onRefresh?: () => void` / `refreshing?: boolean` props wired to RN `RefreshControl`, tinted `colors.accentText`. Wired up on **Home only** for now (re-reads bundled data; establishes the pattern M5's Blog list will reuse). Not added to About/Skills/Privacy/Experience/Projects — nothing there currently refreshes.

## 3. Shared component layout fixes

- **`StatsStrip`** — replace the literal 2×2 shared-grid box (`borderRightWidth`/`borderBottomWidth` on adjoining cells) with a horizontal row of individually-bordered stat cells separated by `Spacing` gaps. Still square, still hairline `border`, just no longer a literal CSS-grid table.
- **`ProjectCard` cover image** — no change; `contentFit="contain"` stays since cover assets aren't guaranteed 16:9.
- **Dashed placeholder/empty-state borders** (`FeaturedProjects` "Coming Soon" card, `ProjectGrid` empty state) — switch from `borderStyle: 'dashed'` to solid hairline `border` at reduced opacity (dashed borders read as a web/wireframe convention).

## Files touched

- `src/app/(tabs)/(home)/_layout.tsx`, `(blog)/_layout.tsx`, `(chat)/_layout.tsx`, `(experience)/_layout.tsx`, `(contact)/_layout.tsx` — header options per §1.
- `src/components/ui/button.tsx` — icon prop, primary-press haptic.
- `src/components/project-card.tsx` — chevron affordance, selection haptic.
- `src/components/ui/screen.tsx` — `onRefresh`/`refreshing` props.
- `src/features/home/components/stats-strip.tsx` — row-of-cells rewrite.
- `src/features/home/components/hero-section.tsx`, `src/features/home/components/featured-projects.tsx` — drop unicode arrows from label strings in favor of `icon`; dashed → solid hairline on the placeholder card.
- `src/features/projects/components/project-grid.tsx` — dashed → solid hairline on the empty state.
- `src/app/(tabs)/(home)/index.tsx` — wire `Screen`'s new refresh props.
- New `src/lib/haptics.ts`.
- `docs/01-design-system.md` — new "Navigation chrome" subsection documenting §1 (currently unspecified there).

## Testing

- `bun run lint` and `bunx tsc --noEmit`.
- Manual pass on **both** iOS and Android simulators, **both** color schemes, and with reduced motion enabled (existing repo Definition of Done).
- Specifically verify: large-title collapse-on-scroll on iOS; Android header looks intentional rather than "large title missing"; haptics fire without crashing where supported and no-op safely where not; pull-to-refresh spinner tint in both schemes; icon/chevron alignment in `Button` and `ProjectCard` in both schemes and both platforms.

## Out of scope

- Blog, Chat, Contact tabs (still M0 placeholders; M5–M7).
- Any change to `docs/02-screens.md` section order/IA.
- Any change to corner radius, type families, or palette tokens.
