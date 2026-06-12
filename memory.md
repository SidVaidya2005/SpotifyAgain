# Memory — Feature 13 Create/Rename/Delete Playlists

Last updated: 2026-06-12

## What was built

Feature 13 (Phase 6, Playlists) — **built + `npm run lint`/`npm run build` GREEN +
LIVE-VERIFIED by the user ("i verified, everything working").** Opens Phase 6;
**Feature 14 (playlist tracks & detail page) is next.**

**No schema, no migration, no new dep** — the `playlists` table + owner-RLS + `playlist_songs`
shipped in Feature 06; the `Playlist` type alias already existed. Pure app code reusing
established patterns (modal/store/action/Button + React Query).

**Feature 13 is UNCOMMITTED on `main`** (not yet committed this session). Re-confirm the git
baseline first: last session-start `git status` showed clean with HEAD `de1acf2 5.12-library-polish`,
which suggests Feature 12 IS already committed (contradicts the older memory's "12 uncommitted").
Run `git status` / `git log --oneline -3` before any commit.

New files (8):
- `src/stores/use-playlist-modal.ts` — store `{ isOpen, editing: {id,title}|null, onOpenCreate,
  onOpenRename(id,title), onClose }`. `editing` null = create, set = rename. Ephemeral UI only.
- `src/actions/create-playlist.ts` — `createPlaylist(title): ActionResult<{id}>`. getUser re-check,
  trim+require title, insert `{user_id, title}`, `revalidatePath('/')`.
- `src/actions/rename-playlist.ts` — `renamePlaylist(id,title): ActionResult` (void). update title
  `.eq('id',id)` (RLS owner-scopes), `revalidatePath('/playlist/'+id)` + `'/'`.
- `src/actions/delete-playlist.ts` — `deletePlaylist(id): ActionResult` (void). delete `.eq('id',id)`
  (playlist_songs cascade), `revalidatePath('/')`.
- `src/hooks/useUserPlaylists.ts` — React Query `['user-playlists']`, browser client, `enabled:!!user`,
  `select('id,title').eq('user_id',user.id).order(created_at desc)`. Mirrors `useLikedSongs`. Exports
  `UserPlaylist {id,title}`.
- `src/server/get-playlist.ts` — `getPlaylistById(id): Playlist|null`. server client, `.maybeSingle()`,
  RLS-scoped (null for non-owner/missing), log+return null.
- `src/components/modals/PlaylistModal.tsx` — one modal both modes; effect `reset({title})` on open/editing;
  onSubmit split into editing/create branches (type-narrowing); create→`router.push('/playlist/'+id)`,
  rename→`router.refresh()`; both `invalidateQueries(['user-playlists'])`.
- `src/components/PlaylistList.tsx` — sidebar list, `'use client'`, hidden for anon. "Playlists" label +
  "+" create at md+; **name links only at lg** (md icon-rail too narrow). `usePathname` active state.
- `src/components/playlist/PlaylistHeaderActions.tsx` — rename btn (`onOpenRename`) + delete btn → local
  `useState` confirm `Modal`; Delete = `Button variant="pill"` + `className="bg-negative text-black ..."`.
- `src/app/(site)/playlist/[id]/page.tsx` — Server Component, `await params`, `requireUser()`,
  `getPlaylistById` → `notFound()` if null; header + `PlaylistHeaderActions` + "no songs yet" body.

Modified (3): `src/providers/ModalProvider.tsx` (+`<PlaylistModal/>`), `src/components/Sidebar.tsx`
(+`<PlaylistList/>` after the nav), `src/components/Header.tsx` (+signed-in "Create playlist"
`MdPlaylistAdd` button next to upload `+`, opens `playlistModal.onOpenCreate`).

`/architect` plan: `~/.claude/plans/abstract-noodling-swan.md`.

## Decisions made (all via /architect, user-chosen — all 4 = recommended option)

- **Minimal `/playlist/[id]` page now** (not page-less). Singular route per architecture.md; hosts
  rename/delete; **tracks (add/remove/reorder) are Feature 14** — 13 is intentionally an empty shell.
- **Surface = sidebar list + Header create.** Playlist *list* sidebar-only (lg names); *create* reachable
  on mobile via Header. No mobile playlist-index page in 13.
- **Delete = confirm dialog** (reuse `Modal`), not native `confirm()`. Red `bg-negative` Delete button.
- **Form = title only** (description/cover columns exist but deferred).
- **One PlaylistModal, two modes**; sidebar freshness via React Query invalidation, page via revalidatePath.

## Problems solved

- **onSubmit ternary type error avoided:** `editing ? rename(...) : create(...)` makes `res` a union of
  `ActionResult<void> | ActionResult<{id}>`, so `res.data.id` won't narrow. Fixed by splitting onSubmit into
  separate editing/create branches.
- **React 19 `set-state-in-effect`** (bit 04/05/09): prefill uses RHF `reset({title})` in the effect, not a
  `setState`, so it's clean.

## Current state

- **Feature 13 done — lint clean, build green, LIVE-VERIFIED.** `/`, `/library`, `/liked`,
  **new `/playlist/[id]`** all `ƒ (Dynamic)`; `ƒ Proxy (Middleware)` prints; TS passes.
- **User live-confirmed (signed in):** create → new page + sidebar entry; rename; delete → confirm → home;
  responsive. The "can't add songs to a playlist yet" they noticed is EXPECTED — that's Feature 14.
- Headless earlier (prod :3098, stopped): anon `/playlist/<uuid>` → 307 → `/`, `/library` → 307 → `/`,
  `/` → 200. Proxy already gated `/playlist`.
- Phases 1–5 done + live-verified. **Phase 6 Feature 13 done + live-verified.**
- **Dev server is RUNNING** this session: background task id `biz9fevg0` (`npm run dev`, :3000).
- Supabase MCP available (project ref `vgsiwqrovctitxkruwpj`).

## Next session starts with

1. **Commit Feature 13** (already live-verified) — convention `phase.feature` ⇒
   **`6.13-create-rename-delete-playlists`**. **NEVER add a co-author** (global CLAUDE.md). Confirm whether
   to commit or the user will; reconcile the Feature-12 commit-state ambiguity (check `git log` first).
2. **Phase 6 — Feature 14: Playlist tracks & detail page.** Add/remove/reorder tracks on `/playlist/[id]`
   (`playlist_songs` with `position`, unique `(playlist_id, song_id)`); playing sets the queue to playlist
   order. Already in place from 13: the `/playlist/[id]` shell, `requireUser`, ownership/`notFound` guard,
   `getPlaylistById`. Will need: an "add to playlist" entry point (e.g. a song-row menu), a `get-playlist-songs`
   read, and `add-song-to-playlist` / `remove-song-from-playlist` / `reorder-playlist` Server Actions.
   Note: `playlist_songs` INSERT RLS already requires the song be visible to the user (public OR own) — Feature
   14 exercises that positive path.

## Open questions

- Commit Feature 13 now (`6.13-…`), or user commits? And is Feature 12 already committed (HEAD ambiguity)?
- Cross-user negative paths still NOT runtime-tested (need a 2nd real auth user): `playlist_songs`
  visibility-gated INSERT (Feature 14), and `/playlist/[id]` `notFound()` for a non-owner's id. RLS validated
  structurally in 06.
- Home "owner sees own private songs" deviation still stands (accepted Feature 08).
