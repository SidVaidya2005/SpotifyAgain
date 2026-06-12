# Memory — Feature 12 Library Polish

Last updated: 2026-06-12

## What was built

Feature 12 (Phase 5, Library & Likes) — **built + `npm run lint`/`npm run build`
GREEN + LIVE-VERIFIED in the browser (user-confirmed 2026-06-12, "verified everything
working fine").** Marks **Phase 5 COMPLETE**; **Feature 13 (Phase 6, playlists) is next.**

UI-polish only — **no schema, no Server Action, no new Supabase read, no new dep.**
`Song` already carried `is_public`; "newly uploaded appears immediately" was already
handled (`UploadModal` `router.refresh()` + `createSong` `revalidatePath('/library')`),
so that was verify-only and untouched.

**Feature 12 is UNCOMMITTED on `main`** (HEAD = `fcaaf82 5.11-like-unlike-liked-songs`).
3 new files + 3 modified (+ `context/progress-tracker.md` + this `memory.md`). NOTE: the
session was renamed "5.12-library-polish" (the proposed commit name) but **no commit has
been made yet** — that rename is just a label.

New files:
- `src/components/VisibilityBadge.tsx` — presentational chip. Props `{ isPublic, className? }`.
  `inline-flex rounded-full bg-surface-2 px-2 py-0.5 text-2xs font-semibold text-muted`,
  `FiGlobe` (h-3 w-3) + "Public" / `FiLock` + "Private". Achromatic by design (DESIGN §7/§9
  — green is functional-only). No `'use client'` (pure props).
- `src/components/library/LibraryUploadButton.tsx` — `'use client'`. `useUploadModal()` →
  `<Button variant="white" onClick={uploadModal.onOpen}>` with `<FiPlus/> Upload`. Optional
  `className` passthrough.
- `src/components/library/LibraryEmptyState.tsx` — `'use client'`. Centered panel on
  `bg-surface rounded-lg py-16`: `FiMusic` in a `bg-surface-2` circle, "Your library is empty"
  (`text-lg font-semibold`), "Upload your first song to get started." (`text-sm text-muted`),
  then `<LibraryUploadButton/>` (reused — single CTA source).

Modified:
- `src/components/SongItem.tsx` — added `showVisibility?: boolean` prop (default false); when
  true renders `<VisibilityBadge isPublic={song.is_public} className="mt-2" />` after the author.
- `src/components/SongGrid.tsx` — added `showVisibility?: boolean`, passes it through to each
  `SongItem`. Default false.
- `src/app/(site)/library/page.tsx` — title row now `flex items-center justify-between gap-4`
  with `<LibraryUploadButton/>` on the right **only when `songs.length > 0`**; body is
  `songs.length === 0 ? <LibraryEmptyState/> : <SongGrid songs={songs} showVisibility/>`.
  Dropped the `emptyMessage` usage here (page owns the empty state now).

`/architect` plan: `~/.claude/plans/feature-12-library-hazy-starfish.md`.

## Decisions made (all via /architect, user-chosen)

- **Indicator: badge BOTH states** ('Public'/'Private') so "no chip" is never ambiguous.
- **Placement: inline, under the author** (`mt-2`), keeping the cover overlay clean.
- **Badge achromatic**, distinguished by icon+label only — accent green stays functional-only.
- **Upload CTA: Header + empty state.** Header button hidden when empty so the two CTAs never
  stack. `Button variant="white"` (not `pill`) to keep green exclusive to playback/active.
- **Badge & buttons are Library-only / opt-in.** `showVisibility` defaults false → Home/Liked/
  Search cards unchanged (no badge leak). Library page stays a Server Component; only the two
  buttons + empty state are client.

## Problems solved

- None of note — clean build first try. The only design tension (which `Button` variant for
  Upload) resolved to `white` to avoid diluting the green=play/active semantic.

## Current state

- **Feature 12 built; `npm run lint` clean; `npm run build` green** (`/`, `/library`, `/liked`
  all `ƒ (Dynamic)`; build still prints `ƒ Proxy (Middleware)`).
- **LIVE-VERIFIED (user-confirmed):** empty `/library` → polished empty state + working Upload
  CTA; upload 1 public + 1 private → both appear immediately with correct chips; header Upload
  button shows when songs exist; Home/`/liked`/Search render NO chip.
- Phases 1–5 done + live-verified. **Phase 5 fully complete (11 + 12).** Feature 13 next.
- Supabase MCP available (project ref `vgsiwqrovctitxkruwpj`). User runs their own
  `npm run dev` (port 3000; this session's dev task id `bdae7iop3`).

## Next session starts with

1. **Commit Feature 12** (already live-verified) — convention `phase.feature`: proposed
   **`5.12-library-polish`**. **NEVER add a co-author** (global CLAUDE.md). Confirm whether to
   commit or the user will.
2. **Phase 6 — Feature 13: Create, rename & delete playlists.** Per CLAUDE.md read `context/`
   first; consider `/architect`. Build-plan §13 scope: `PlaylistModal` (create/rename), sidebar
   lists the user's playlists, delete control on the playlist page; `create-playlist` /
   `rename-playlist` / `delete-playlist` Server Actions against `playlists` (RLS owner-scoped);
   revalidate sidebar + page. (`playlists` table + RLS already shipped in Feature 06.)
   Reusable: `Modal` shell, `Button`, the `use-upload-modal` store pattern for a new
   `use-playlist-modal` store, `requireUser()`, React Query infra, `ActionResult` contract.

## Open questions

- Commit Feature 12 now (`5.12-library-polish`), or user commits himself?
- Cross-user visibility-gated INSERT **negative** path (`liked_songs`/`playlist_songs` "song must
  be visible") still NOT runtime-tested — needs a 2nd real auth user + a private song + live
  sessions. Positive `liked_songs` path covered (Feature 11). Feature 14 (`playlist_songs`) will
  exercise the positive playlist path.
- Home "owner sees own private songs" deviation still stands (accepted Feature 08; revert = add
  `.eq('is_public', true)` to `getSongs`).
