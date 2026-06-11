# Memory — Feature 02: App Shell Layout

Last updated: 2026-06-11

## What was built

Feature **02 App shell layout** (Phase 1) — complete and verified. Established the visual foundation with responsive shell, design tokens, font, and mock-data grid:

- **`src/app/globals.css`** — full `@theme` block (colors, breakpoints, radii, shadows) + body base styles
- **`src/lib/utils.ts`** — `cn()` helper (clsx + tailwind-merge)
- **`src/lib/constants.ts`** — `STORAGE_BUCKETS`, `ACCEPTED_AUDIO_TYPES`, `ACCEPTED_IMAGE_TYPES`
- **`src/types/index.ts`** — `Song` type (8 fields) + `ActionResult<T>` union
- **`src/app/layout.tsx`** — Figtree font, root shell: Sidebar + main + PlayerBar + BottomNav
- **`src/components/Sidebar.tsx`** — responsive sidebar: full at `lg`+, icon rail at `md`, hidden below
- **`src/components/BottomNav.tsx`** — fixed nav visible only below `md`, hidden at md+
- **`src/components/player/PlayerBar.tsx`** — fixed full-width bar (h-24), 3 layout zones (cover/title, controls, volume)
- **`src/components/SongCard.tsx`** — song card component (cover placeholder, title, author, hover state)
- **`src/app/(site)/page.tsx`** — Home Server Component with 6 mock songs, responsive grid (1→2→3→4→5 cols)

## Decisions made

- **Separate `<Sidebar>` and `<BottomNav>` components** — not a single responsive variant. Clearer boundaries, easier to maintain/extend.
- **Song type created now** — matches schema from `architecture.md`; Feature 06 (Supabase) replaces with generated types, no refactor needed.
- **Styled player bar shell** — correct height, zones, placeholder content; Feature 09 drops audio logic in without restyling.
- **Grid responsive fully wired** — `grid-cols-1 xs:grid-cols-2 sm:grid-cols--2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5` all in place at build time.

## Problems solved

- None this session — Feature 02 built without friction.

## Current state

- ✅ App compiles and runs (`npm run dev` at localhost:3000)
- ✅ Shell renders with all components (Sidebar, BottomNav, PlayerBar, Home grid)
- ✅ Responsive layout verified: sidebar full→rail→hidden, nav shows only below md, grid columns correct at every breakpoint
- ✅ Design tokens applied: dark background (`#121212`), white text, Spotify Green accents (`#1ed760`), all colors in use
- ✅ Figtree font loaded and applied via `next/font/google`
- ✅ Lint clean, build succeeds
- ✅ progress-tracker.md updated: Feature 02 ✅, Next: Feature 03

## Next session starts with

**Feature 03 — Supabase clients & middleware.** Wire Supabase clients (`src/lib/supabase/{client,server,middleware}.ts`), root `middleware.ts` (session refresh), `.env.local` keys, and `next.config.ts` image patterns. No UI/auth behavior yet — just plumbing so Features 04+ can use Supabase. Verify a Server Component constructs the server client without error, signed in or anonymous.

## Open questions

- None blocking.
