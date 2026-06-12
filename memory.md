# Memory — Feature 08 Home & Library Wired to Real Songs

Last updated: 2026-06-12

## What was built

Feature 08 (Phase 3, final feature) — **built + verified headless; signed-in browser
round-trip still pending**. Replaces the mock catalog with real Supabase reads and
adds the personal `/library` page. All changes **uncommitted** on `main` (latest
commit `61d2b97 3.7-upload-song-flow`).

New files:
- `src/server/get-songs.ts` — `getSongs(): Promise<Song[]>`. Server client;
  `from('songs').select('*').order('created_at', { ascending: false })`. Verbatim
  from `architecture.md` → Key Patterns. Logs `[getSongs]` + returns `[]` on error.
- `src/server/get-songs-by-user.ts` — `getSongsByUser(userId: string): Promise<Song[]>`.
  Same shape + `.eq('user_id', userId)`. Logs `[getSongsByUser]` + returns `[]`.
- `src/components/SongGrid.tsx` — shared presentational grid (Server-renderable, NO
  `'use client'`). Props `{ songs: Song[]; emptyMessage?: string }`. Renders the
  responsive `grid-cols-1 … xl:grid-cols-5` of `SongItem`s, or
  `<p className="text-sm text-muted">{emptyMessage}</p>` when empty.
- `src/app/(site)/library/page.tsx` — `default async function Library()`. Calls
  `requireUser()` (redirects anon → `/`) then `getSongsByUser(user.id)`; same page
  wrapper as Home (`space-y-8 p-6`, heading "Your Library" / "Songs you've uploaded"),
  `<SongGrid songs emptyMessage="You haven't uploaded any songs yet." />`.

Modified:
- `src/app/(site)/page.tsx` — deleted `MOCK_SONGS`; `Home` is now `async`; reads
  `getSongs()`; heading block unchanged ("Recently Uploaded"); grid replaced with
  `<SongGrid songs emptyMessage="No songs yet." />`.
- `context/progress-tracker.md` — 08 checked off; status → Phase 3 complete / Phase 4
  next; full 08 decision + verification log appended.

Approved plan: `/Users/siddarthvaidya/.claude/plans/tingly-bouncing-narwhal.md`.

## Decisions made

- **Home shows "everything RLS allows" (USER-CHOSEN via /architect).** `getSongs()` is
  `select('*')` with NO `is_public` filter. Anon sees only public (RLS); a **signed-in
  uploader also sees their own private songs on Home**. Safe — RLS still hides private
  rows from *other* users (security invariant holds). Softly deviates from
  project-overview's "private appears only in the uploader's library" prose. **Revert
  path if ever wanted strictly-public Home:** add `.eq('is_public', true)` to
  `getSongs` (Library keeps its own fetcher).
- **`SongGrid` extracted as a reusable primitive** rather than duplicating the grid
  markup. Owns the empty state. Will be reused by Liked/Search/Playlist. (code-standards
  "repeated patterns become primitives".)
- **Cover art NOT wired (USER-CHOSEN) — `SongItem` untouched**, still the grey
  `bg-surface-2` placeholder. No `<Image>`/`getPublicUrl`. Deferred.
- **`/library` scope kept tight (USER-CHOSEN) — list only.** Build-plan §12 ("Library
  polish": dedicated upload button, public/private indicator badge, polished empty
  state) deliberately deferred. Upload affordance for Library users = the existing
  signed-in "+" in the `Header`; NOT moved/duplicated into Library here.
- No `LIMIT` on the catalog read (catalog is tiny). No mutations, no client fetching,
  no playback (`SongItem` stays non-interactive until Features 09–10).

## Problems solved

- **Stale background dev server confusion.** A pre-existing `npm run dev` (PID 15542,
  port 3000) was already running this project when the session began. Next 16 dev
  detects an existing instance and EITHER bumps to 3001 OR just reports the old PID —
  so spawned test servers didn't serve, and curling 3000 hit the old process. It also
  died mid-restart during probing, yielding a garbled "no songs AND no empty-state"
  read. **Fix: start a clean instance on an explicit port (`PORT=3077 npm run dev`),
  parse the actual bound port from the log, test against that, then kill only that
  PID.** (The user's port-3000 server is now DOWN — they can restart it.)
- **Couldn't verify the populated grid headlessly** because the `songs` table is empty
  (0 rows; Feature-07 test uploads were cleaned up). **Fix: inserted 1 public + 1
  private sentinel `songs` row via the Supabase MCP (`execute_sql`, project_id
  `vgsiwqrovctitxkruwpj`, under the lone real user `34ec0b15-c7ae-4cae-9147-63b176031274`),
  curled anon Home → only the PUBLIC title rendered, PRIVATE correctly hidden by RLS →
  deleted both rows.** `songs` count confirmed back to 0.

## Current state

- **Feature 08 built; lint + `npm run build` green** (`/` and `/library` both
  `ƒ (Dynamic)`; build still prints `ƒ Proxy (Middleware)`).
- **Verified headless:** anon `/` → 200, no `MOCK_SONGS`; anon `/library` → 307 → `/`;
  populated grid + anon RLS visibility (public shown, private hidden) proven via the
  temp sentinel song.
- **`songs` table is currently EMPTY (0 rows).** So Home renders the "No songs yet."
  empty state for anon right now.
- **Phases 1+2 done; Phase 3 (06, 07, 08) done.** All 08 changes UNCOMMITTED on `main`.
- Supabase MCP IS available this session (project ref `vgsiwqrovctitxkruwpj`).

## Next session starts with

1. **Commit decision (UNANSWERED).** Feature 08 ready to commit. Proposed message per
   repo convention (phase.feature): **`3.8-home-and-library-real-songs`** (confirm exact
   wording). **NEVER add a co-author** (global CLAUDE.md). Confirm whether to commit or
   the user will.
2. **Optional: live signed-in round-trip for 08** (only thing not headless-verifiable —
   needs Google OAuth + a real upload): sign in → upload a song via Header "+" → confirm
   it appears on Home immediately AND in `/library`; confirm a *private* upload shows in
   `/library` + on the owner's own Home but not to anyone else. This also finally
   verifies 07→08 end-to-end and re-populates the empty catalog.
3. Then **09 Persistent player** (Phase 4, first feature). Per CLAUDE.md read `context/`
   first. This is where `SongItem` becomes clickable and the bottom `PlayerBar` plays
   real audio. Key pieces (from `architecture.md`/`library-docs.md`): `usePlayer` Zustand
   store (`activeId` + `ids[]` queue), `useOnPlay` hook (sets both), `useLoadSongUrl`
   hook (resolve Storage public URL via `getPublicUrl`), `use-sound` in `PlayerContent`
   keyed by `songUrl` with `sound?.unload()` cleanup. `PlayerBar.tsx` exists as a
   placeholder. Works for anonymous visitors on public songs. NOTE: cover art is still a
   placeholder — wiring `<Image>` art is deferred and could pair well with player work.

## Open questions

- Commit 08 now as `3.8-home-and-library-real-songs`, or user commits himself?
- **Home "own private songs visible to owner" deviation** — accepted this session; flag
  to revisit if it ever bothers the product spec (revert = `.eq('is_public', true)`).
- Cross-user visibility-gated INSERT (`liked_songs`/`playlist_songs` "song must be
  visible") still NOT runtime-tested — needs a 2nd real auth user + sessions. Lands in
  Features 11/14.
- When does cover art get wired (placeholder still in `SongItem`)? Candidate: alongside
  Feature 09 player work, or a later polish pass.
