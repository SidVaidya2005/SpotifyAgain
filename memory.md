# Memory — Feature 02 App Shell Layout (verification pass)

Last updated: 2026-06-12

## What was built

This session was a **verification/audit pass on Feature 02 (App Shell Layout)**,
which was already built. No new feature scope — corrected the existing shell to
match the context docs. Files touched (all uncommitted, on `main`):

- `src/components/player/PlayerBar.tsx` — fixed play-icon color bug; a11y.
- `src/app/layout.tsx` — mobile bottom padding; deduped body color classes.
- `src/components/Sidebar.tsx` — removed gray border; aria-labels; centered md rail; dropped fragment.
- `src/components/BottomNav.tsx` — removed gray border (inset shadow seam); redundant-class cleanup.
- `src/app/(site)/page.tsx` — h1 size; grid cleanup; SongItem import/usage.
- `src/components/SongCard.tsx` → `src/components/SongItem.tsx` — `git mv` rename (component `SongCard`→`SongItem`, props `SongCardProps`→`SongItemProps`).
- `context/progress-tracker.md` — appended the verification-pass note.

The approved plan lives at
`/Users/siddarthvaidya/.claude/plans/02-app-shell-layout-verify-elegant-yao.md`.

## Decisions made

- **`text-base` is a Tailwind v4 font-size utility, NOT a color.** It collides
  with the `--color-base` token in the shared `text-` namespace and resolves to
  font-size, so the play icon was rendering white-on-green. Use `text-black` for
  the `#000000` play icon. Never write `text-base` expecting the base color.
  (Verified via Context7 `/tailwindlabs/tailwindcss.com`.)
- **No raw gray borders** (DESIGN §7). Sidebar uses `bg-surface`/`bg-base` shade
  contrast for separation; BottomNav uses a 1px inset `shadow-[0_-1px_0_var(--color-base)]`
  seam instead of `border-border`.
- **Mobile padding:** `<main>` is `pb-48 md:pb-24` — base clears player + bottom
  nav; at md+ the nav is hidden so only the player (96px) needs clearing.
- Kept `PlayerBar` as `'use client'` (Feature 09 needs it imminently — avoid churn).
- Left the "SpotifyAgain" wordmark as-is (established product name across all docs).

## Problems solved

- The white-play-icon defect (root cause = the `text-base` font-size/color
  collision above). Fixed with `text-black` on the button + removing `text-base`
  from the `<FiPlay>` icon (it now inherits).

## Current state

- All 7 plan findings applied. **`npm run lint` clean**, **`npm run build` green**
  (Next.js 16.2.9, TypeScript passed, 4 static pages generated).
- Changes are **uncommitted** in the working tree (git status shows the 5 edits,
  the SongCard→SongItem rename, and the progress-tracker edit).
- progress-tracker: Phase 1, Last completed = **02**, Next = **03**.

## Next session starts with

Two options, in order:
1. (Optional, not yet done) Visual confirmation: `npm run dev` and view at
   375 / 768 / 1024 / 1440px — dark play icon, no mobile overlap, no gray seams,
   centered md icon-rail, 24px h1.
2. The roadmap item: **03 — Supabase clients & middleware** (Phase 1). Per
   CLAUDE.md, read `context/` first; pull `@supabase/ssr` + Next.js 16 middleware
   docs from Context7 before writing. Supabase clients live ONLY in
   `src/lib/supabase/`; service-role key never in client code.

## Open questions

- Should the uncommitted Feature 02 verification changes be committed before
  starting 03? (Reminder: per global CLAUDE.md, **never add a co-author** to commits.)
- Visual breakpoint check was deferred — confirm whether it's wanted before 03.
