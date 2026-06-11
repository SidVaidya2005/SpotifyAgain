# Memory — Feature 01: Project Scaffold

Last updated: 2026-06-11

## What was built

Feature **01 Project scaffold** (Phase 1) — complete and verified. Stood up the
runnable Next.js app from an empty repo:

- `create-next-app` baseline merged into the repo root (scaffolded in a temp dir
  via rsync to avoid clobbering `CLAUDE.md`/`context/`/`LICENSE`/`README.md`).
- **Next.js 16.2.9 + React 19.2.4 + TypeScript (strict) + Tailwind v4**, App
  Router, `src/` dir, `@/*` alias, ESLint flat config.
- All approved deps installed (supabase-js, ssr, react-query, zustand, use-sound,
  radix dialog+slider, react-hook-form, react-icons, sonner, clsx, tailwind-merge,
  uuid, @types/uuid).
- `src/` skeleton created empty with `.gitkeep`: `components hooks stores server
  actions lib providers types` (+ `app`).
- Blank page only: `src/app/globals.css` = just `@import "tailwindcss"`; minimal
  `page.tsx` (renders "SpotifyAgain") + `layout.tsx`; demo SVGs removed.
- `next.config.ts` sets `turbopack.root = import.meta.dirname`.
- `package.json` name = `spotifyagain`.

## Decisions made

(Full list lives in `context/progress-tracker.md` → Decisions. Key ones:)

- **Adopted Next.js 16, not the originally-documented 15** — `create-next-app@latest`
  ships 16.2.9. Updated all version refs (architecture, code-standards,
  library-docs, build-plan, CLAUDE.md) 15→16. Async `cookies()`/`params`,
  middleware, and Server Action patterns are unchanged in 16, so no other guidance moved.
- Installed **all** approved deps up front (per build-plan §01), not lazily.
- Kept 01 a true blank page — tokens/Figtree/dark theme/shell deferred to **02**.
- No `tailwind.config.ts` (Tailwind v4 is CSS-driven).

## Problems solved

- `create-next-app .` refuses to run in a non-empty root → scaffolded in `/tmp`
  then rsync-merged with excludes, preserving existing docs.
- Next/Turbopack inferred the **wrong workspace root** from a stray
  `~/package-lock.json` → fixed by pinning `turbopack.root` in `next.config.ts`.
- Benign `DEP0205` ("module.register() deprecated") warning on Node 26 is from a
  toolchain loader hook, not our code — safe to ignore.

## Current state

- `npm run lint` ✅ clean · `npm run build` ✅ (no warnings, `/` static) ·
  `npm run dev` ✅ serves 200 at localhost:3000.
- Nothing committed yet — working tree has the full scaffold + doc edits unstaged.
- No Supabase clients, middleware, env files, auth, or UI shell yet (later features).

## Next session starts with

**Feature 02 — App shell layout.** Build the persistent Sidebar + main + fixed
bottom player slot with mock data, wire the `@theme` design tokens + breakpoints
into `globals.css` (canonical block in `architecture.md` → Key Patterns), load
**Figtree** via `next/font/google`, and stub Home with a mock song grid (1→2→3→4→5
cols across sm/md/lg/xl). Verify responsively at ~375 / 768 / 1024 / 1440px.
Follow `DESIGN-spotify.md` for every visual choice.

## Open questions

- None blocking. Optional: whether to `git commit` feature 01 before starting 02
  (user has not asked to commit yet). Per global rule, **never add a co-author**
  to commits.
