# Native companion app — design system

Port of the web design system (`~/projects/my-portfolio/app/globals.css`, `app/layout.tsx`, `components/ui/*`) into React Native for this Expo app.

Implements roadmap **M1**. Decisions: **D3** (typed theme + `StyleSheet.create`, no NativeWind), **D4** (same brand, native conventions, derived light theme). Content/copy for screens: [`04-content-inventory.md`](./04-content-inventory.md).

---

## 1. Why not NativeWind

The scaffold already enables the React Compiler. A Tailwind/NativeWind transform adds another compile layer, slows feedback, and fights the "typed tokens in TypeScript" shape already started in `src/constants/theme.ts`. Styles stay in `StyleSheet.create` fed by theme modules.

---

## 2. Dark palette (verbatim from web)

Source: `app/globals.css` `@theme inline` (verified 2026-08-15):

| Token | Web CSS var | Value | RN name |
|---|---|---|---|
| Background | `--color-bg` | `#0A0A0F` | `bg` |
| Surface | `--color-surface` | `#111118` | `surface` |
| Border | `--color-border` | `#1E1E2E` | `border` |
| Border hover | `--color-border-hover` | `#2E2E48` | `borderPressed` |
| Text | `--color-text` | `#F0EDE8` | `text` |
| Muted text | `--color-text-muted` | `#9CA3AF` | `textMuted` |
| Accent | `--color-accent` | `#00E5A0` | `accent` |
| Accent dim | `--color-accent-dim` | `#00E5A015` | `accentDim` → `rgba(0, 229, 160, 0.082)` |
| Code | `--color-code` | `#E2A84B` | `code` |

`borderHover` becomes `borderPressed` because RN has no hover; press / selected borders use this token.

`accentDim`: the web stores an 8-digit hex (`#00E5A015` ≈ 8.2% alpha). RN prefers an explicit `rgba(0, 229, 160, 0.082)`.

`accentBorder`: `rgba(0, 229, 160, 0.2)` in dark — matches the web Badge accent variant `border-(--color-accent)/20`.

### Dark contrast (text-bearing pairs on `bg`)

| Pair | Ratio |
|---|---|
| `text` on `bg` | **16.91:1** |
| `textMuted` on `bg` | **7.78:1** |
| `accent` on `bg` | **11.96:1** |
| `code` on `bg` | **9.35:1** |

Primary button fill uses `accent` with label colour `bg` (**11.96:1**).

---

## 3. Derived light palette

`#00E5A0` on white / near-white is roughly **1.5:1** (measured **1.58:1** on `#FAFAF7`) and fails WCAG as text. Light mode therefore keeps the raw accent for **fills, dots, and rules only**, and introduces `accentText` for type and icons.

| Token | Value | Role |
|---|---|---|
| `bg` | `#FAFAF7` | Screen background |
| `surface` | `#FFFFFF` | Cards / elevated panels |
| `border` | `#E4E2DC` | Default hairline |
| `borderPressed` | `#C9C6BD` | Pressed / selected border |
| `text` | `#14141A` | Primary type |
| `textMuted` | `#5B6068` | Secondary type |
| `accent` | `#00E5A0` | Fills, rules, dots only |
| `accentText` | `#00805A` | Accent type + icons |
| `accentDim` | `rgba(0, 128, 90, 0.10)` | Soft accent wash |
| `accentBorder` | `rgba(0, 128, 90, 0.2)` | Accent outline at 20% (Badge accent variant) |
| `code` | `#8A5A00` | Inline / mono accent |

### Light contrast (text-bearing pairs)

| Pair | Ratio | Notes |
|---|---|---|
| `text` on `bg` | **17.54:1** | AAA |
| `textMuted` on `bg` | **6.05:1** | AA |
| `accentText` on `bg` | **4.74:1** | AA for normal text |
| `code` on `bg` | **5.67:1** | AA |
| `text` on `surface` | **18.35:1** | AAA |
| `textMuted` on `surface` | **6.33:1** | AA |
| raw `accent` on `bg` | **1.58:1** | **Do not use for text** |
| Primary label `bg` on fill `accent` | **11.96:1** | Keep dark label on accent fill in both schemes |

Ghost / text buttons in light mode use `accentText`, not `accent`.

---

## 4. Typography

Same three families the web loads via `next/font/google` in `app/layout.tsx`:

| Family | Weights | Role |
|---|---|---|
| Space Mono | 400, 700 | Display / headings / labels / buttons |
| DM Sans | 400, 500, 700 | Body |
| JetBrains Mono | 400 | Code |

In the app they come from the `@expo-google-fonts/{space-mono,dm-sans,jetbrains-mono}` packages (same Google Fonts source as the web, pinned by `bun.lock`, licences included, bundled at build time). The asset map in `src/theme/fonts.ts` is handed to `expo-font`'s `useFonts`. Root `_layout.tsx` holds the splash screen until fonts resolve (and until the theme provider is ready). Do not add `assets/fonts/`.

### Type scale

| Role | Size | Line height | Family (weight encoded in name) |
|---|---|---|---|
| `title` | 36 | 44 | `SpaceMono_700Bold` |
| `heading` | 24 | 32 | `SpaceMono_700Bold` |
| `subheading` | 18 | 26 | `SpaceMono_700Bold` |
| `body` | 16 | 26 | `DMSans_400Regular` |
| `bodyMedium` | 16 | 26 | `DMSans_500Medium` |
| `small` | 12 | 18 | `SpaceMono_400Regular` |
| `label` | 11 | 16 | `SpaceMono_400Regular` (uppercase, widetrack via `letterSpacing: 2`) |
| `code` | 14 | 22 | `JetBrainsMono_400Regular` |

Platform note: Android may need slight size nudges; keep tokens central so a single `Platform.select` can adjust without forking components.

---

## 5. Square corners are a rule

Radius is **`0` everywhere**. The web repo enforces this with `lib/ui/prose.test.ts`, which fails if prose class strings contain `rounded-*`. Do not introduce `borderRadius` on cards, buttons, badges, chips, inputs, or sheets unless a platform primitive forces it (e.g. system alert) — and never on brand surfaces we draw ourselves.

---

## 6. Spacing

Extend the existing `src/constants/theme.ts` `Spacing` object; do not replace it.

Current scaffold:

```ts
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;
```

Add (keep numeric ladder consistent):

```ts
seven: 96,
gutter: 24,      // screen horizontal padding (web `px-6`)
section: 64,     // major section breaks
```

Move the object into `src/theme/spacing.ts` and re-export from `src/theme/index.ts`. `BottomTabInset` and `MaxContentWidth` stay available for layout; tab inset still comes from platform safe area + NativeTabs.

---

## 7. Motion

One easing curve everywhere — the web's `cubic-bezier(0.16, 1, 0.3, 1)`:

```ts
import { Easing } from 'react-native-reanimated';

export const easeOutExpo = Easing.bezier(0.16, 1, 0.3, 1);
```

| Pattern | Spec |
|---|---|
| Entrance (`Reveal`) | 600 ms fade + 20 px rise |
| List stagger | 50–60 ms per item |
| Press feedback | opacity / border only, ≤150 ms |

Implementation: **Reanimated 4** (already a dependency: `react-native-reanimated@4.5.1`). Every non-essential animation is guarded by `useReducedMotion()` (Reanimated / RN); when reduced, render children with no transform.

---

## 8. `src/theme/` file shapes

### `colors.ts`

```ts
export type ColorSchemeName = 'light' | 'dark';

export type ThemeColors = {
  bg: string;
  surface: string;
  border: string;
  borderPressed: string;
  text: string;
  textMuted: string;
  accent: string;
  accentText: string; // equals accent in dark; #00805A in light
  accentDim: string;
  accentBorder: string; // accent at 20% alpha (Badge accent outline)
  code: string;
};

export const Colors: Record<ColorSchemeName, ThemeColors>;
```

### `typography.ts`

```ts
export type TypeRole =
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'bodyMedium'
  | 'small'
  | 'label'
  | 'code';

// No fontWeight — @expo-google-fonts family names already encode weight
// (e.g. SpaceMono_700Bold). Stacking fontWeight produces synthetic
// double-bolding on Android.
export type TypeStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: 'uppercase';
};

export const FontFamilies: {
  display: string;     // SpaceMono_400Regular
  displayBold: string; // SpaceMono_700Bold
  body: string;        // DMSans_400Regular
  bodyMedium: string;  // DMSans_500Medium
  bodyBold: string;    // DMSans_700Bold
  code: string;        // JetBrainsMono_400Regular
};

export const Typography: Record<TypeRole, TypeStyle>;
```

### `spacing.ts`

```ts
export const Spacing: {
  half: 2;
  one: 4;
  two: 8;
  three: 16;
  four: 24;
  five: 32;
  six: 64;
  seven: 96;
  gutter: 24;
  section: 64;
};
```

### `motion.ts`

```ts
import { Easing } from 'react-native-reanimated';

export const Motion = {
  easing: Easing.bezier(0.16, 1, 0.3, 1), // EasingFunctionFactory, not EasingFunction
  entranceMs: 600,
  entranceOffsetY: 20,
  staggerMs: 55,
  pressMs: 150,
} as const;
```

`Easing.bezier` returns an `EasingFunctionFactory`, which is what `withTiming` and the layout-animation builders accept — do not annotate it as `EasingFunction`.

### `index.ts`

```ts
export type AppTheme = {
  scheme: ColorSchemeName;
  colors: ThemeColors;
  typography: typeof Typography;
  spacing: typeof Spacing;
  motion: typeof Motion;
  radius: 0;
};

export function getTheme(scheme: ColorSchemeName): AppTheme;
```

### `theme-provider.tsx` (replaces `src/hooks/use-theme.ts`)

Lives beside the token modules. Do **not** re-export it from `src/theme/index.ts` (that would cycle with the provider importing `getTheme`).

```ts
export function AppThemeProvider(props: {
  children: React.ReactNode;
  scheme?: ColorSchemeName; // explicit override wins; else follow system
}): React.ReactElement;

export function useTheme(): AppTheme; // throws outside the provider
export function useThemeColors(): ThemeColors;
```

An explicit `scheme` prop wins so the M1 dev gallery can render both schemes at once. Otherwise follow system appearance via the existing `useColorScheme` from `@/hooks/use-color-scheme`, falling back to `'dark'` (brand default) when the system value is null / undefined / `'unspecified'`. Both schemes are first-class (D4).

---

## 9. Primitives (`src/components/ui/`)

Each primitive is StyleSheet-based, consumes `useTheme()`, and has **radius 0**. Web source named for each.

### `Text`

Derives from: raw headings / body / `JetBrains` spans on the web (no single `Text` component).

```ts
type TextProps = {
  role?: TypeRole; // default 'body'
  color?: 'text' | 'textMuted' | 'accent' | 'accentText' | 'code';
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  accessibilityRole?: AccessibilityRole;
};
```

In light mode, `color="accent"` for readable type should prefer `accentText` at call sites (or map `accent` → `accentText` when used as type colour).

### `Badge`

Derives from: `components/ui/Badge.tsx`.

```ts
type BadgeProps = {
  label: string;
  variant?: 'accent' | 'muted' | 'code'; // default 'muted'
};
```

### `Button`

Derives from: `components/ui/Button.tsx`.

```ts
type ButtonProps = {
  variant?: 'primary' | 'ghost';
  label: string;
  onPress?: () => void;
  href?: string; // opens via Linking / router
  disabled?: boolean;
  loading?: boolean;
};
```

Primary: `accent` fill, label colour `bg` (both schemes). Ghost: transparent + `accent`/`accentText` border and label. Min press height 44.

### `Card`

Derives from: `components/ui/Card.tsx`.

```ts
type CardProps = {
  children: React.ReactNode;
  onPress?: () => void; // when set, border uses borderPressed on press
  style?: StyleProp<ViewStyle>;
};
```

Surface + border; no shadow; no radius. Hover → press.

### `SectionLabel`

Derives from: `components/ui/SectionLabel.tsx`.

```ts
type SectionLabelProps = { children: string };
```

Space Mono, uppercase, widetrack, `accent` / `accentText`.

### `PromptChip`

Derives from: `components/ui/PromptChip.tsx`.

```ts
type PromptChipProps = {
  label: string;
  onPress: () => void;
};
```

Bordered chip, min height 44, press swaps border/text to accent.

### `Divider`

Derives from: web `border-t border-(--color-border)` section rules.

```ts
type DividerProps = { inset?: boolean };
```

### `Screen`

Derives from: web page shells (`max-w-* mx-auto px-6 py-24`).

```ts
type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean; // default true
  gutter?: boolean; // default true → Spacing.gutter
  safe?: boolean;   // default true
};
```

### `Reveal`

Derives from: `components/ui/ScrollReveal.tsx` (Framer Motion → Reanimated).

```ts
type RevealProps = {
  children: React.ReactNode;
  delayMs?: number; // default 0; list stagger uses index * Motion.staggerMs
};
```

600 ms fade + 20 px rise; skipped when `useReducedMotion()`.

### `Skeleton`

Derives from: web chat/admin skeletons (pulse blocks).

```ts
type SkeletonProps = {
  width: number | `${number}%`;
  height: number;
};
```

Surface → slightly lighter pulse; no radius; respect reduced motion (static dim block).

---

## 10. Dev gallery exit criterion

A `__DEV__`-only screen must render, in both schemes (toggle):

- Every `Text` role
- Every `Badge` / `Button` variant
- `Card`, `SectionLabel`, `PromptChip`, `Divider`, `Skeleton`
- A `Reveal` block

That is the M1 **Exit** in [`00-roadmap.md`](./00-roadmap.md).
