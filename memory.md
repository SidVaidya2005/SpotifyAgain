# Memory — Feature 15 Search Page

Last updated: 2026-06-12

## What was built

Feature 15 (Phase 7, Search) — **built + `npm run lint`/`npm run build` GREEN +
headless-verified + LIVE-VERIFIED by the user ("i verified everything is working").**
This **completes Phase 7.** Next (and last) is **Phase 8 — Feature 16 (Deploy to Render).**

**Feature 15 is UNCOMMITTED on `main`.** HEAD at session start AND now is
`dc57260 6.14-playlist-tracks-detail-page` (so 14 is committed; 15 is not). Run
`git status` / `git log --oneline -3` before committing. I offered to commit as
`6.15-search-page` (**NO co-author** — global CLAUDE.md rule); user hasn't said go yet,
and hasn't said `main`-direct vs branch.

**No new dependency, no migration** — search is a read over the existing `songs` table;
RLS already permits public + own.

New files (4):
- `src/hooks/useDebounce.ts` — generic `useDebounce<T>(value, delay=300)`. setState is
  inside the `setTimeout` callback (a timer), NOT the effect body → dodges React 19's
  `react-hooks/set-state-in-effect` rule (bit 04/05/09/13). Cleanup `clearTimeout`.
- `src/server/search-songs.ts` — VERBATIM from `code-standards.md` → Boundary Patterns.
  Sanitize: `query.replace(/[,()*:"\\]/g,' ').replace(/[%_]/g,'\\$&').trim()`; `if(!q) return []`;
  `.or(\`title.ilike.%${q}%,author.ilike.%${q}%\`).order('created_at',{ascending:false})`;
  log `[searchSongs]` + return `[]` on error. Server client, RLS-scoped (public + own).
- `src/components/SearchInput.tsx` (`'use client'`) — pill input. Local `useState` seeded
  from an `initialQuery` **prop** (NOT `useSearchParams()` — avoids its Suspense boundary;
  later prop changes don't clobber typing since useState ignores subsequent initial values).
  `useDebounce(value,300)` → effect `router.replace(debounced ? \`/search?q=${encodeURIComponent(debounced)}\` : '/search')`
  (replace, not push; no setState in the effect → rule-safe). Styling DESIGN §4 Inputs:
  `rounded-full bg-surface-2 text-text placeholder:text-muted shadow-inset-border focus:outline-none`,
  left-padded for an absolute `FiSearch` icon. `max-w-md`.
- `src/app/(site)/search/page.tsx` — async Server Component, PUBLIC (no `requireUser()`;
  `/search` is NOT in `proxy.ts` protectedPaths). `searchParams: Promise<{q?:string}>` →
  `const {q}=await searchParams` (async in Next 16) → `query=q?.trim()??''` →
  `songs = query ? await searchSongs(query) : []`. Renders `<h1>Search</h1>` + `<SearchInput
  initialQuery={query}/>`, then `query===''` → prompt "Search for songs by title or artist.",
  else `<SongGrid songs emptyMessage={\`No songs found for "${query}".\`}/>`.

Modified (2) — Feature-14 follow-up (close the "no in-page add-songs on /playlist/[id]" gap):
- `src/components/playlist/PlaylistHeaderActions.tsx` — added an "Add songs" circular
  `<Link href="/search" aria-label="Add songs">` (`FiPlus`) before the rename/delete icon
  buttons, matching their style (`h-11 w-11 rounded-full bg-surface-2 ... hover:text-accent`).
- `src/app/(site)/playlist/[id]/page.tsx` — empty state now: short copy + a **white-pill**
  `<Link href="/search">` "Add songs" CTA (`bg-text text-black`, matching the Library
  upload-CTA precedent — keeps accent green for playback).

`/architect` plan: `~/.claude/plans/feature-15-search-page-drifting-sun.md`.
Progress tracker updated (Phase 7 COMPLETE + live-verified note for 15).

## Decisions made

- **3 /architect decisions (USER-CHOSEN):** (1) **URL-driven Server Component** data flow
  (debounced `?q=` → server read) over client React Query; (2) **reuse `SongGrid`** (cards)
  over a new vertical row list; (3) Feature-14 follow-up = **empty state + header button**
  (both plain `<Link>` to `/search`; NO playlist-id context threaded into search — the
  result's existing add-to-playlist modal lets the user pick any playlist).
- **Param name = `q`** (searches title+author, so `q` > `title`). **Debounce = 300ms.**
- Nav needed **no change** — `Sidebar`/`BottomNav` already carried `/search` + `FiSearch`.
- Results playable + like + add-to-playlist come free from existing `SongItem` (anon→AuthModal).

## Problems solved

- **React 19 `set-state-in-effect`** avoided two ways: the `useDebounce` setState sits in the
  `setTimeout` callback (not the effect body), and `SearchInput`'s URL-sync effect calls only
  `router.replace` (no setState).
- **`useSearchParams()` Suspense requirement** sidestepped by passing `initialQuery` as a prop
  from the server page instead of reading the hook in the client input.
- **Headless no-results false positive:** grepping raw HTML for "No songs found for" matches
  even when results render, because `emptyMessage` is always serialized as a `SongGrid` prop.
  The reliable signal is the rendered `SongItem` card (`class="truncate font-bold text-text">`).

## Current state

- **Feature 15 done — lint clean, build green, headless + LIVE-verified by user.** Build:
  `/`, `/library`, `/liked`, `/playlist/[id]`, **`/search`** all `ƒ (Dynamic)`; `ƒ Proxy
  (Middleware)` prints; TS passes, no `any`.
- Headless (prod :3101, stopped): anon `/search` → 200 (not gated), `/library` control → 307;
  sanitization `?q=` for `% ( , * \ "` all → 200 (no 500); empty→prompt; no-match→message;
  positive path rendered a matching card.
- Phases 1–7 now COMPLETE. Only Phase 8 (Deploy) remains.
- **A dev server was started by the USER this session** via `npm run dev` (background id
  `bzv7famp3`, default :3000) — may still be running.
- Supabase MCP available (project ref `vgsiwqrovctitxkruwpj`). Context7 + Supabase MCP usable.

## Next session starts with

1. **Commit Feature 15** (live-verified) — `6.15-search-page`. **NEVER add a co-author**
   (global CLAUDE.md). Confirm `main`-direct vs branch first. Working tree currently has the
   4 new files + 2 modified (PlaylistHeaderActions, playlist page) + `context/progress-tracker.md`
   + `memory.md` uncommitted.
2. **Phase 8 — Feature 16: Deploy to Render** (FINAL feature). Per `build-plan.md` §16 +
   `architecture.md` → Deployment: Render **Node Web Service**, build `npm install && npm run
   build`, start `npm run start`, binds to `PORT`. Set prod env vars in Render
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` = Render
   URL). Add the Render URL to **Supabase Auth** Site/Redirect URLs + the Google Cloud OAuth
   client (external dashboards — user must do these). If a FRESH Supabase project is used, the
   05 + 06 migrations must be run against prod. Seed a few **public** demo songs. Optionally
   commit a `render.yaml`. User has been running `/architect` before each feature.

## Open questions

- Commit Feature 15 now (`6.15-…`), directly to `main` or on a branch?
- Deploy target details for 16: reuse the EXISTING Supabase project (`vgsiwqrovctitxkruwpj`)
  for prod or spin up a fresh one (fresh → must re-run the 05 + 06 migrations + recreate
  buckets)? Render account/repo connection is external (user-driven).
- Cross-user negative paths still NOT runtime-tested (need a 2nd real auth user): visibility-
  gated INSERTs (liked/playlist_songs), reorder/remove on a non-owned playlist, `/playlist/[id]`
  + (now) cross-user search visibility. RLS validated structurally in 06; single-account only.
- Home "owner sees own private songs" deviation still stands (accepted Feature 08). Note: a
  signed-in user's **private** songs are also searchable by them on `/search` (same RLS), which
  is correct/expected.
