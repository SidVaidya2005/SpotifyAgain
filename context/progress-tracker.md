# Progress Tracker

> **Role:** Live build status — what's done, in progress, and next.
> **Read at the start of every session**; **update after every completed feature.**
> **Relates to:** mirrors `build-plan.md` exactly.

Update this file after every completed feature. Any AI agent reading this should
immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 1 — Foundation & Shell
**Last completed:** 02 App shell layout
**Next:** 03 Supabase clients & middleware

---

## Progress

### Phase 1 — Foundation & Shell
- [x] 01 Project scaffold
- [x] 02 App shell layout
- [ ] 03 Supabase clients & middleware

### Phase 2 — Authentication
- [ ] 04 Google sign-in
- [ ] 05 Action gating, profiles & sign-out

### Phase 3 — Songs & Upload
- [ ] 06 Database schema & storage
- [ ] 07 Upload song flow
- [ ] 08 Home & library wired to real songs

### Phase 4 — Playback
- [ ] 09 Persistent player
- [ ] 10 Queue, next & previous

### Phase 5 — Library & Likes
- [ ] 11 Like / unlike & Liked Songs
- [ ] 12 Library polish

### Phase 6 — Playlists
- [ ] 13 Create, rename & delete playlists
- [ ] 14 Playlist tracks & detail page

### Phase 7 — Search
- [ ] 15 Search page

### Phase 8 — Deployment
- [ ] 16 Deploy to Render

---

## Decisions Made During Build

- **01 — Next.js 16, not 15.** `create-next-app@latest` now ships Next.js
  **16.2.9** (with React 19.2.4, Tailwind v4). Chose to adopt 16 rather than pin
  to the originally-documented 15; the context docs (`architecture.md`,
  `code-standards.md`, `library-docs.md`, `build-plan.md`, `CLAUDE.md`) were
  updated to say 16. The async `cookies()`/`params`, middleware, and Server
  Action patterns those docs rely on are unchanged in 16, so no other guidance moved.
- **01 — Scaffolded via temp dir + merge.** Repo root was non-empty (`CLAUDE.md`,
  `context/`), so `create-next-app .` won't run; scaffolded in a temp dir and
  rsync-merged in, preserving the existing `CLAUDE.md`/`context/`/`LICENSE`/`README.md`.
- **01 — Installed all approved deps up front** (per build-plan §01), not lazily.
- **01 — Kept feature 01 a blank page.** `globals.css` is just
  `@import "tailwindcss"`; design tokens, Figtree, dark theme, and the shell are
  deferred to feature 02, per the build-plan split.
- **01 — Pinned `turbopack.root`** in `next.config.ts` to this project. A stray
  `package-lock.json` in the home dir made Next/Turbopack infer the wrong
  workspace root; pinning silences the warning and keeps file tracing/env
  resolution correct (locally and on Render).
- **01 — No `tailwind.config.ts`.** Tailwind v4 is CSS-driven; none created.

---

## Notes

- **02 — Separate `<Sidebar>` and `<BottomNav>` components.** Chose distinct components over a single responsive variant component — cleaner separation of concerns, easier to extend per-layout if needed. Icon rail at `md` uses `md:block lg:hidden` to show a music note (♫), full text labels at `lg`+.
- **02 — Song type created early.** `src/types/index.ts` defines `Song` and `ActionResult<T>` now; Supabase types (Feature 06) will replace it without refactoring the grid/card components.
- **02 (verification pass) — audit fixes applied.** Reviewed the shell against
  `DESIGN-spotify.md`/`code-standards.md` and corrected: (1) **`text-base` is a
  Tailwind v4 font-size utility, NOT a color** — it collides with the `--color-base`
  token, so the play-button icon was rendering white. Use `text-black` for the
  `#000000` play icon; never use `text-base` expecting the base color. (2) `<main>`
  bottom padding now `pb-48 md:pb-24` so mobile content clears both the BottomNav
  and player bar. (3) Removed raw gray `border-border` dividers (DESIGN §7) — sidebar
  relies on `bg-surface`/`bg-base` shade contrast; BottomNav uses a 1px inset
  `shadow-[0_-1px_0_var(--color-base)]` seam. (4) Home `<h1>` → `text-2xl` (24px
  Section Title). (5) a11y: `aria-label`s on sidebar/player icon buttons, centered
  md icon-rail, ≥44px prev/next touch targets. (6) Renamed `SongCard` → `SongItem`
  to match `architecture.md`. Lint + `next build` green.
