# Design System Inspired by Spotify

> **Role:** UI/visual source of truth — visual theme, color, typography, components, layout, elevation, and responsive behavior.
> **Read before building or styling any UI**; it overrides ad-hoc visual choices.
> **Relates to:** mechanics (Tailwind/Radix usage) live in `code-standards.md` and `library-docs.md`; this file owns the *look*. The font choice is reflected in `architecture.md`'s stack.

## Branding & Legal

This is an independent **portfolio clone inspired by Spotify's UX** — not affiliated
with, endorsed by, or connected to Spotify. Do **not** ship Spotify's trademarks or
proprietary assets:

- Use an **original app name, logo, and wordmark**. Never use Spotify's logo, the
  "Spotify" wordmark, or their icon. Wherever this doc says "logo," it means the
  app's own mark.
- The Circular typeface is proprietary — we use **Figtree** (see §3).
- "Spotify Green" `#1ed760` is referenced for visual fidelity; paired with an
  original name/logo (not Spotify's brand identity) it keeps the clone clearly
  independent.
- Emulating layout, interaction patterns, and the color *system* is fine for a
  learning/portfolio piece; copying brand identity and assets is not.

## 1. Visual Theme & Atmosphere

Spotify's web interface is a dark, immersive music player that wraps listeners in a near-black cocoon (`#121212`, `#181818`, `#1f1f1f`) where album art and content become the primary source of color. The design philosophy is "content-first darkness" — the UI recedes into shadow so that music, podcasts, and playlists can glow. Every surface is a shade of charcoal, creating a theater-like environment where the only true color comes from the iconic Spotify Green (`#1ed760`) and the album artwork itself.

The typography uses **Figtree** — the closest freely-licensable geometric sans to Spotify's proprietary Circular family (Circular by Lineto), chosen for its clean near-circular bowls and UI-grade weight range. The type system is compact and functional: 700 (bold) for emphasis and navigation, 600 (semibold) for secondary emphasis, and 400 (regular) for body. Buttons use uppercase with positive letter-spacing (1.4px–2px) for a systematic, label-like quality.

What distinguishes Spotify is its pill-and-circle geometry. Primary buttons use 500px–9999px radius (full pill), circular play buttons use 50% radius, and search inputs are 500px pills. Combined with heavy shadows (`rgba(0,0,0,0.5) 0px 8px 24px`) on elevated elements and a unique inset border-shadow combo (`rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset`), the result is an interface that feels like a premium audio device — tactile, rounded, and built for touch.

**Key Characteristics:**
- Near-black immersive dark theme (`#121212`–`#1f1f1f`) — UI disappears behind content
- Spotify Green (`#1ed760`) as singular brand accent — never decorative, always functional
- Figtree font family (free geometric sans, closest to Spotify's Circular)
- Pill buttons (500px–9999px) and circular controls (50%) — rounded, touch-optimized
- Uppercase button labels with wide letter-spacing (1.4px–2px)
- Heavy shadows on elevated elements (`rgba(0,0,0,0.5) 0px 8px 24px`)
- Semantic colors: negative red (`#f3727f`), warning orange (`#ffa42b`), announcement blue (`#539df5`)
- Album art as the primary color source — the UI is achromatic by design

## 2. Color Palette & Roles

> **Token names:** the `--…` names in this section are Spotify's original CSS
> variables, kept for reference. In this project the palette is implemented as
> Tailwind v4 `@theme` tokens (`--color-base`, `--color-surface`, `--color-text`,
> `--color-muted`, `--color-negative`, …) that generate utilities like `bg-base`,
> `text-text`, `text-muted`, `text-negative` — see `architecture.md` → Key Patterns.
> Style with those token utilities, not the descriptive names below.

### Primary Brand
- **Spotify Green** (`#1ed760`): Primary brand accent — play buttons, active states, CTAs
- **Near Black** (`#121212`): Deepest background surface
- **Dark Surface** (`#181818`): Cards, containers, elevated surfaces
- **Mid Dark** (`#1f1f1f`): Button backgrounds, interactive surfaces

### Text
- **White** (`#ffffff`): token `text-text` (`--color-text`), primary text
- **Silver** (`#b3b3b3`): Secondary text, muted labels, inactive nav
- **Near White** (`#cbcbcb`): Slightly brighter secondary text
- **Light** (`#fdfdfd`): Near-pure white for maximum emphasis

### Semantic
- **Negative Red** (`#f3727f`): token `text-negative` (`--color-negative`), error states
- **Warning Orange** (`#ffa42b`): token `text-warning` (`--color-warning`), warning states
- **Announcement Blue** (`#539df5`): token `text-announcement` (`--color-announcement`), info states

### Surface & Border
- **Dark Card** (`#252525`): Elevated card surface
- **Mid Card** (`#272727`): Alternate card surface
- **Border Gray** (`#4d4d4d`): Button borders on dark
- **Light Border** (`#7c7c7c`): Outlined button borders, muted links
- **Separator** (`#b3b3b3`): Divider lines
- **Light Surface** (`#eeeeee`): Light-mode buttons (rare)
- **Spotify Green Border** (`#1db954`): Green accent border variant

### Shadows
- **Heavy** (`rgba(0,0,0,0.5) 0px 8px 24px`): Dialogs, menus, elevated panels
- **Medium** (`rgba(0,0,0,0.3) 0px 8px 8px`): Cards, dropdowns
- **Inset Border** (`rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset`): Input border-shadow combo

## 3. Typography Rules

### Font Families

Spotify's proprietary fonts (the Circular family) aren't licensable for this project, so we use **Figtree** — the closest freely-available geometric sans: clean, near-circular bowls, UI-optimized, with variable weights 300–900 (covering the 400 / 600 / 700 this system needs). Load it via `next/font/google`, expose it as a CSS variable, and reference it through the stack below. Wherever the table or example prompts name a Spotify font, read it as Figtree.

- **Title**: **Figtree**, heavier weights (700) for section titles.
- **UI / Body**: **Figtree**, weights 400–600 for everything else.
- **Font stack**: `Figtree, "Helvetica Neue", Helvetica, Arial, sans-serif`
- **Alternatives** (if ever swapped): Montserrat or Poppins — both geometric and free on Google Fonts.

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Section Title | Figtree | 24px (1.50rem) | 700 | normal | normal | Bold title weight |
| Feature Heading | Figtree | 18px (1.13rem) | 600 | 1.30 (tight) | normal | Semibold section heads |
| Body Bold | Figtree | 16px (1.00rem) | 700 | normal | normal | Emphasized text |
| Body | Figtree | 16px (1.00rem) | 400 | normal | normal | Standard body |
| Button Uppercase | Figtree | 14px (0.88rem) | 600–700 | 1.00 (tight) | 1.4px–2px | `text-transform: uppercase` |
| Button | Figtree | 14px (0.88rem) | 700 | normal | 0.14px | Standard button |
| Nav Link Bold | Figtree | 14px (0.88rem) | 700 | normal | normal | Navigation |
| Nav Link | Figtree | 14px (0.88rem) | 400 | normal | normal | Inactive nav |
| Caption Bold | Figtree | 14px (0.88rem) | 700 | 1.50–1.54 | normal | Bold metadata |
| Caption | Figtree | 14px (0.88rem) | 400 | normal | normal | Metadata |
| Small Bold | Figtree | 12px (0.75rem) | 700 | 1.50 | normal | Tags, counts |
| Small | Figtree | 12px (0.75rem) | 400 | normal | normal | Fine print |
| Badge | Figtree | 10.5px (0.66rem) | 600 | 1.33 | normal | `text-transform: capitalize` |
| Micro | Figtree | 10px (0.63rem) | 400 | normal | normal | Smallest text |

### Principles
- **Bold/regular binary**: Most text is either 700 (bold) or 400 (regular), with 600 used sparingly. This creates a clear visual hierarchy through weight contrast rather than size variation.
- **Uppercase buttons as system**: Button labels use uppercase + wide letter-spacing (1.4px–2px), creating a systematic "label" voice distinct from content text.
- **Compact sizing**: The range is 10px–24px — narrower than most systems. Spotify's type is compact and functional, designed for scanning playlists, not reading articles.
- **Global script support**: The extensive fallback stack (Arabic, Hebrew, Cyrillic, Greek, Devanagari, CJK) reflects Spotify's 180+ market reach.

## 4. Component Stylings

### Buttons

**Dark Pill**
- Background: `#1f1f1f`
- Text: `#ffffff` or `#b3b3b3`
- Padding: 8px 16px
- Radius: 9999px (full pill)
- Use: Navigation pills, secondary actions

**Dark Large Pill**
- Background: `#181818`
- Text: `#ffffff`
- Padding: 0px 43px
- Radius: 500px
- Use: Primary app navigation buttons

**Light Pill**
- Background: `#eeeeee`
- Text: `#181818`
- Radius: 500px
- Use: Light-mode CTAs (cookie consent, marketing)

**Outlined Pill**
- Background: transparent
- Text: `#ffffff`
- Border: `1px solid #7c7c7c`
- Padding: 4px 16px 4px 36px (asymmetric for icon)
- Radius: 9999px
- Use: Follow buttons, secondary actions

**Circular Play**
- Background: `#1f1f1f`
- Text: `#ffffff`
- Padding: 12px
- Radius: 50% (circle)
- Use: Play/pause controls

### Cards & Containers
- Background: `#181818` or `#1f1f1f`
- Radius: 6px–8px
- No visible borders on most cards
- Hover: slight background lightening
- Shadow: `rgba(0,0,0,0.3) 0px 8px 8px` on elevated

### Inputs
- Search input: `#1f1f1f` background, `#ffffff` text
- Radius: 500px (pill)
- Padding: 12px 96px 12px 48px (icon-aware)
- Focus: border becomes `#000000`, outline `1px solid`

### Navigation
- Dark sidebar with Figtree 14px weight 700 for active, 400 for inactive
- `#b3b3b3` muted color for inactive items, `#ffffff` for active
- Circular icon buttons (50% radius)
- The app's own logo/wordmark top-left in the accent green (an original mark — never Spotify's logo; see Branding & Legal)

### Tooltip
- Background: `#1f1f1f` (token `bg-surface-2`); text `#ffffff` (`text-text`) at 12px (`text-xs`)
- Radius: 6px (`rounded-md`); padding ~8px × 4px (`px-2 py-1`); ~6px offset from the trigger
- Elevation: Dialog shadow `rgba(0,0,0,0.5) 0px 8px 24px` (`shadow-dialog`, Level 3)
- Use: hover/focus label for **icon-only** controls (player transport, like, header actions, modal close, the `md` sidebar rail). A pointer/keyboard affordance only — the control keeps its `aria-label`, so the tooltip is never the sole label. No accent.

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 1px, 2px, 3px, 4px, 5px, 6px, 8px, 10px, 12px, 14px, 15px, 16px, 20px

### Grid & Container
- Sidebar (fixed) + main content area
- Grid-based album/playlist cards
- Full-width now-playing bar at bottom
- Responsive content area fills remaining space

### Whitespace Philosophy
- **Dark compression**: Spotify packs content densely — playlist grids, track lists, and navigation are all tightly spaced. The dark background provides visual rest between elements without needing large gaps.
- **Content density over breathing room**: This is an app, not a marketing site. Every pixel serves the listening experience.

### Border Radius Scale
- Minimal (2px): Badges, explicit tags
- Subtle (4px): Inputs, small elements
- Standard (6px): Album art containers, cards
- Comfortable (8px): Sections, dialogs
- Medium (10px–20px): Panels, overlay elements
- Large (100px): Large pill buttons
- Pill (500px): Primary buttons, search input
- Full Pill (9999px): Navigation pills, search
- Circle (50%): Play buttons, avatars, icons

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Base (Level 0) | `#121212` background | Deepest layer, page background |
| Surface (Level 1) | `#181818` or `#1f1f1f` | Cards, sidebar, containers |
| Elevated (Level 2) | `rgba(0,0,0,0.3) 0px 8px 8px` | Dropdown menus, hover cards |
| Dialog (Level 3) | `rgba(0,0,0,0.5) 0px 8px 24px` | Modals, overlays, menus |
| Inset (Border) | `rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset` | Input borders |

**Shadow Philosophy**: Spotify uses notably heavy shadows for a dark-themed app. The 0.5 opacity shadow at 24px blur creates a dramatic "floating in darkness" effect for dialogs and menus, while the 0.3 opacity at 8px blur provides a more subtle card lift. The unique inset border-shadow combination on inputs creates a recessed, tactile quality.

## 7. Do's and Don'ts

### Do
- Use near-black backgrounds (`#121212`–`#1f1f1f`) — depth through shade variation
- Apply Spotify Green (`#1ed760`) only for play controls, active states, and primary CTAs
- Use pill shape (500px–9999px) for all buttons — circular (50%) for play controls
- Apply uppercase + wide letter-spacing (1.4px–2px) on button labels
- Keep typography compact (10px–24px range) — this is an app, not a magazine
- Use heavy shadows (`0.3–0.5 opacity`) for elevated elements on dark backgrounds
- Let album art provide color — the UI itself is achromatic

### Don't
- Don't use Spotify Green decoratively or on backgrounds — it's functional only
- Don't use light backgrounds for primary surfaces — the dark immersion is core
- Don't skip the pill/circle geometry on buttons — square buttons break the identity
- Don't use thin/subtle shadows — on dark backgrounds, shadows need to be heavy to be visible
- Don't add additional brand colors — green + achromatic grays is the complete palette
- Don't use relaxed line-heights — Spotify's typography is compact and dense
- Don't expose raw gray borders — use shadow-based or inset borders instead

## 8. Responsive Behavior

The project's breakpoints are the Tailwind v4 `@theme` tokens in `architecture.md`
→ Key Patterns; the implementation contract (sidebar states + grid columns per
device) is the table in `code-standards.md` → Visual Design → Responsive. The
values below describe the intent.

### Breakpoints (project tokens)
| Token | ≥ width | Device |
|-------|---------|--------|
| (base) | 0 | small phone |
| `xs` | 425px | large phone |
| `sm` | 576px | small tablet |
| `md` | 768px | iPad portrait |
| `lg` | 1024px | iPad landscape / desktop |
| `xl` | 1280px | large desktop |

### Collapsing Strategy
- Sidebar: **full** at `lg`+ → **collapsed icon rail** at `md` → **hidden (bottom nav)** below `md`
- Album grid: 1 → 2 (`sm`) → 3 (`md`) → 4 (`lg`) → 5 (`xl`) columns
- Now-playing bar: fixed full-width, maintained at all sizes
- Search: pill input maintained, width adjusts
- Navigation: sidebar → bottom bar below `md`

## 9. Agent Prompt Guide

### Quick Color Reference
- Background: Near Black (`#121212`)
- Surface: Dark Card (`#181818`)
- Text: White (`#ffffff`)
- Secondary text: Silver (`#b3b3b3`)
- Accent: Spotify Green (`#1ed760`)
- Border: `#4d4d4d`
- Error: Negative Red (`#f3727f`)

### Example Component Prompts
- "Create a dark card: #181818 background, 8px radius. Title at 16px Figtree weight 700, white text. Subtitle at 14px weight 400, #b3b3b3. Shadow rgba(0,0,0,0.3) 0px 8px 8px on hover."
- "Design a pill button: #1f1f1f background, white text, 9999px radius, 8px 16px padding. 14px Figtree weight 700, uppercase, letter-spacing 1.4px."
- "Build a circular play button: Spotify Green (#1ed760) background, #000000 icon, 50% radius, 12px padding."
- "Create search input: #1f1f1f background, white text, 500px radius, 12px 48px padding. Inset border: rgb(124,124,124) 0px 0px 0px 1px inset."
- "Design navigation sidebar: #121212 background. Active items: 14px weight 700, white. Inactive: 14px weight 400, #b3b3b3."

### Iteration Guide
1. Start with #121212 — everything lives in near-black darkness
2. Spotify Green for functional highlights only (play, active, CTA)
3. Pill everything — 500px for large, 9999px for small, 50% for circular
4. Uppercase + wide tracking on buttons — the systematic label voice
5. Heavy shadows (0.3–0.5 opacity) for elevation — light shadows are invisible on dark
6. Album art provides all the color — the UI stays achromatic

## 10. Modernization v2 — Sticky Header, Card Depth & Section Rhythm

> **Added 2026-06-13** (enhancement #4). Evolves the visual layer toward more depth and
> clearer section separation while staying inside the existing palette/geometry — **no new
> brand colors, green stays functional, all values are existing `@theme` tokens.** This
> section is authoritative for the header, card depth, search dropdown, and section rhythm.

### 10.1 Fixed top bar + app-shell

A full-width bar **fixed across the very top of the viewport** (spanning above the sidebar),
present on every page. It anchors a fully **fixed app-shell**: header (top, full width) → a row of
[ sidebar | scrolling content ] → player bar (bottom, full width). **Only the main content
scrolls;** the header, sidebar, and player bar are all `fixed` and never move (no scroll "jiggle").

- **Shell positions:** header `fixed` top, full width, fixed height (`h-16`). Sidebar `fixed` on
  the left, **inset between the header and the player bar** (top = header height `top-16`, bottom =
  player height `bottom-24`) — **not full height**; it scrolls internally if its playlists overflow.
  Player bar `fixed` full-width bottom (`h-24`). Main is the only scroll region, offset by the header
  (top), the sidebar width (left, `md+`), and the player / bottom-nav (bottom).
- **Layout (within the header):** logo/wordmark **left** (the app's green wordmark, all sizes) ·
  **search** (center-left, takes available width) · **actions right** (upload, create-playlist,
  avatar / Log in). The sidebar keeps the primary nav; the wordmark lives **only** in the header.
- **Surface (depth):** translucent **`bg-base/80` + `backdrop-blur-md`** so content scrolls faintly
  beneath it; separated from content by a **soft bottom seam** (a 1px inset shadow in
  `--color-surface` — **never a raw gray border**, DESIGN §7), not a visible line.
- **Padding/height:** fixed `h-16`, `px-4 md:px-6`; a single row at all widths. On mobile the search
  input shrinks but stays a usable pill (does not collapse to an icon).

### 10.2 Search input + live dropdown

- **Input:** pill (`rounded-full`), `bg-surface-2`, `shadow-inset-border` (DESIGN §4 Inputs),
  a leading search icon, `text-text` / `placeholder:text-muted`.
- **Dropdown panel:** `bg-surface`, `rounded-lg`, `shadow-dialog` (Level 3), anchored under
  the input; max-height with internal scroll.
- **Result row:** ~40px square cover (`rounded`), title (`text-sm font-bold text-text`) +
  author (`text-xs text-muted`); hover `bg-surface-2`. A footer row **"Show all results"**
  routes to `/search`.
- States: empty input → no panel; query with no matches → a muted "No results" row.

### 10.3 Card depth (hover-lift)

Elevates the grid cards (`SongItem`) so the grid reads with more dimension:

- **Resting:** `bg-card` (unchanged), `rounded-lg`.
- **Hover:** `bg-card-2` **+ `-translate-y-1` lift + `shadow-card`** (Level 2), smooth
  `transition`. The existing hover circular-play / like / add-to-playlist overlays are kept.

### 10.4 Section rhythm & top gradient

- **Section headings:** each page section opens with a **Feature Heading** (18px / 600,
  `text-lg font-semibold`) or **Section Title** (24px / 700) and is separated by generous
  vertical spacing (`space-y-8` rhythm) — separation through space + heading weight, not gray
  rules.
- **Top gradient:** a subtle achromatic band at the very top of the main content —
  `linear-gradient(to bottom, var(--color-surface), transparent)` (i.e. `from-surface
  to-base`/transparent), low height (~160–200px), behind the content. Adds atmosphere/depth;
  **never tinted with the accent or any new color.**

### 10.5 Guardrails (unchanged)

- Green only on play/active/CTA. No raw gray borders — use shade/shadow/seam. Compact type
  (10–24px). Pill/circle geometry. Heavy shadows for elevation. Responsive contract
  (`code-standards.md` → Visual Design) still holds: sidebar rail/full, grid 1→2→3→4→5,
  player bar fixed full-width.
