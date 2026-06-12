# Memory — Feature 14 Playlist Tracks & Detail Page

Last updated: 2026-06-12

## What was built

Feature 14 (Phase 6, Playlists) — **built + `npm run lint`/`npm run build` GREEN +
LIVE-VERIFIED by the user ("i verified everything working").** This **completes
Phase 6.** Next is **Phase 7 — Feature 15 (Search page).**

**Feature 14 is UNCOMMITTED on `main`.** Baseline at session start was clean, HEAD
`ddb7374 6.13-create-rename-delete-playlists` (so 12 AND 13 are committed). Run
`git status` / `git log --oneline -3` before committing. I offered to commit as
`6.14-playlist-tracks-detail-page` (NO co-author — global CLAUDE.md); user hasn't
said go yet.

**One new approved dependency: @dnd-kit** — `@dnd-kit/core@^6.3.1`,
`@dnd-kit/sortable@^10`, `@dnd-kit/modifiers@^9`, `@dnd-kit/utilities@^3.2.2`
(utilities for `CSS.Transform`). Installed clean against React 19, no peer-dep
conflict. Used the **classic** API (`DndContext`/`SortableContext`/`useSortable`),
not the newer `@dnd-kit/react`. `context/code-standards.md` approved-deps list was
amended (project rule: update the list before installing). **No schema/migration** —
`playlist_songs` + its 4 RLS policies + `unique(playlist_id, song_id)` shipped in 06.

New files (8):
- `src/server/get-playlist-songs.ts` — `getPlaylistSongs(playlistId): Song[]`, embeds
  `playlist_songs → songs(*)`, `order('position', asc)`, `.returns<{position;songs:Song}[]>()`
  override (same as `get-liked-songs`), maps to `row.songs`.
- `src/actions/add-song-to-playlist.ts` — next position = `max(position)+1` (0 if empty);
  `23505` → "already in this playlist" via error-code allowlist; `revalidatePath('/playlist/'+id)`.
- `src/actions/remove-song-from-playlist.ts` — delete by playlist_id+song_id (gaps OK).
- `src/actions/reorder-playlist.ts` — `reorderPlaylist(playlistId, orderedSongIds[])`:
  sequential awaited UPDATEs set `position = index` (safe — no position-unique constraint).
- `src/stores/use-add-to-playlist-modal.ts` — `{isOpen, songId, onOpen(id), onClose}`.
- `src/components/modals/AddToPlaylistModal.tsx` — lists `useUserPlaylists()`; click →
  `addSongToPlaylist` → toast + close + `router.refresh()`; empty state → opens create modal.
- `src/components/AddToPlaylistButton.tsx` — `MdPlaylistAdd` icon button; anon→AuthModal,
  signed-in→opens the modal; `revealOnHover` like `LikeButton`.
- `src/components/playlist/PlaylistTrackList.tsx` + `PlaylistTrackRow.tsx` — drag-sortable list.

Modified (5): `ModalProvider` (+`<AddToPlaylistModal/>`), `SongItem` (+`AddToPlaylistButton`
top-left of cover), `player/PlayerContent` (+`AddToPlaylistButton` beside like, `hidden sm:flex`),
`app/(site)/playlist/[id]/page.tsx` (reads tracks, renders list or empty state),
`context/code-standards.md` (approved-deps). `/architect` plan:
`~/.claude/plans/feature-14-playlist-encapsulated-marshmallow.md`.

## Decisions made

- **4 /architect decisions (USER-CHOSEN; 3/4 = recommended):** (1) numbered drag-sortable
  **row list** (new components), not the card grid; (2) **drag-and-drop reorder via @dnd-kit**
  (the non-recommended pick — required the new dep); (3) **"Add to playlist" icon button** on
  song cards + player bar → modal (direct icon, NOT a ⋯ dropdown — no dropdown primitive
  exists, out of scope); (4) **server read + revalidate/refresh** canonical, with **optimistic
  local order during drag**.
- **NEW (USER-DECIDED 2026-06-12): no in-page "add song" on the playlist page — defer to
  Feature 15.** Feature 14 intentionally has NO way to add songs from `/playlist/[id]` itself
  (user picked "add from song cards → modal" over an in-page picker). Fix rides on Feature 15:
  add an **"Add songs" button on the playlist page + its empty state that links to `/search`**,
  where the existing add-to-playlist button completes the flow. Do this as part of / right
  after Feature 15. (User explicitly chose "Defer to Feature 15" over "build in-page picker now".)

## Problems solved

- **React 19 `set-state-in-effect`** (bit 04/05/09/13): avoided by **keying the list in the
  page** on the server song-id order (`key={tracks.map(t=>t.id).join(',')}`) so add/remove/
  order-change **remounts** it and reseeds local `items` — no props→state effect. Optimistic
  reorder lives in the drag-end **event handler** (allowed), not an effect.
- **Successful reorder = no flash:** post-reorder server order == optimistic order → same key →
  no remount. Reorder failure rolls back local `items` + toasts.
- **Touch drag vs scroll:** drag handle has **`touch-none`** so a touch-drag on the handle won't
  scroll the page; rows scroll normally elsewhere. PointerSensor `distance:5` so a tap-to-play
  isn't read as a drag. KeyboardSensor for a11y. Modifiers: restrictToVerticalAxis + restrictToParentElement.
- **Embed typing:** reused `.returns<>()` override (generated types mis-infer the many-to-one
  `songs(*)` embed as an array).

## Current state

- **Feature 14 done — lint clean, build green, LIVE-VERIFIED by user.** `/`, `/library`,
  `/liked`, `/playlist/[id]` all `ƒ (Dynamic)`; `ƒ Proxy (Middleware)` prints; TS passes, no `any`.
- Headless (prod :3099, stopped): anon `/playlist/<uuid>` → 307 → `/`, `/library` → 307 → `/`,
  `/` → 200.
- Phases 1–6 now COMPLETE + live-verified.
- **Dev server is RUNNING this session:** background task `b5cmxvmjk` (`npm run dev`, default :3000).
- Supabase MCP available (project ref `vgsiwqrovctitxkruwpj`).

## Next session starts with

1. **Commit Feature 14** (live-verified) — `6.14-playlist-tracks-detail-page`. **NEVER add a
   co-author** (global CLAUDE.md). Confirm whether to commit directly to `main` or branch first.
2. **Phase 7 — Feature 15: Search page.** `/search` with debounced query → `searchParams` →
   `search-songs.ts` (`searchSongs` — **SANITIZE the query** before `.or(title.ilike,
   author.ilike)`, per code-standards; RLS-scoped to public + own); reuse `SongGrid`;
   empty/no-results states; results playable + add-to-playlist when signed in. The `useDebounce`
   hook is referenced in architecture but **does not exist yet** — create it.
   **+ INCLUDE the Feature-14 follow-up:** "Add songs" button on `/playlist/[id]` + empty state
   linking to `/search` (see Decisions). User has been running `/architect` before each feature.

## Open questions

- Commit Feature 14 now (`6.14-…`), directly to `main` or on a branch?
- Cross-user negative paths still NOT runtime-tested (need a 2nd real auth user): `playlist_songs`
  visibility-gated INSERT (positive path now exercised), reorder/remove on a non-owned playlist,
  and `/playlist/[id]` `notFound()` for a non-owner. RLS validated structurally in 06.
- Home "owner sees own private songs" deviation still stands (accepted Feature 08).
