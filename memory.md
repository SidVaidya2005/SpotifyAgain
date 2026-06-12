# Memory — Feature 09 Persistent Player

Last updated: 2026-06-12

## What was built

Feature 09 (Phase 4, first feature) — **built + fully verified (lint, build,
headless, AND a user live-browser run).** The bottom player now plays real
uploaded audio; clicking a song starts it, and it persists across navigation.
All changes are **UNCOMMITTED** on `main` (latest commit `d9e9f19
3.8-home-and-library-real-songs`).

New files:
- `src/stores/use-player.ts` — `usePlayer` zustand store, verbatim
  `architecture.md` shape: `ids: string[]`, `activeId?`, `setId`, `setIds`,
  `reset`. No domain data, no Supabase.
- `src/hooks/useOnPlay.ts` — `useOnPlay(songs: Song[]) => (id) => void`; sets
  `activeId` + `ids` (queue = the list played from). No auth gate (anon plays
  public songs). Uses narrow `usePlayer` selectors.
- `src/hooks/useGetSongById.ts` — `useGetSongById(id?) => { song?, isLoading }`.
  Browser client, RLS-scoped `from('songs').select('*').eq('id',id).single()`,
  plain `useEffect` (NOT React Query — still deferred to 11). All setState lives
  inside an async `run()` to satisfy the React 19 lint rule.
- `src/hooks/useLoadSongUrl.ts` — `useLoadSongUrl(song?) => string`; memoized
  `getPublicUrl(song.song_path)` from the `songs` bucket.
- `src/hooks/useLoadImage.ts` — `useLoadImage(song?) => string | null`; same over
  the `images` bucket + `song.image_path`.
- `src/components/player/PlayerContent.tsx` — owns playback. `use-sound` keyed by
  `songUrl`; local `isPlaying`/`position`/`volume`/`isMuted`; cover `<Image>` +
  title/author; play/pause; **inert** prev/next (TODO Feature 10); seek (500ms
  `sound.seek()` poll) + time labels; volume (reactive `volume` HookOption) +
  mute. Volume cluster is `hidden md:flex`.
- `src/components/player/SeekSlider.tsx` + `VolumeSlider.tsx` — controlled Radix
  `@radix-ui/react-slider` (Root/Track/Range/Thumb), muted→accent on hover.

Modified:
- `src/components/player/PlayerBar.tsx` — rewritten as orchestrator: reads
  `activeId` → `useGetSongById` → `useLoadSongUrl` → renders `IdlePlayer`
  placeholder ("Nothing playing") or `<PlayerContent key={songUrl} …>`. Still
  mounted once in `src/app/layout.tsx`; the `key` forces use-sound reload per track.
- `src/components/SongGrid.tsx` — now `'use client'`; computes
  `onPlay = useOnPlay(songs)` and passes `onClick` to each `SongItem`.
- `src/components/SongItem.tsx` — now `'use client'`; props `{ song, onClick }`;
  real `<Image>` cover via `useLoadImage`; **green hover Circular Play button**
  (`bg-accent text-black`, DESIGN §4/§9), `stopPropagation`; whole card also clickable.
- `context/progress-tracker.md` — 09 checked off, status → Phase 4 / Feature 10
  next, full decision + live-verification log appended.

Approved plan: `~/.claude/plans/feature-09-persistent-cozy-boole.md`.

## Decisions made (all via /architect, user-chosen unless noted)

- **Store stays minimal; active song is FETCHED, not stored.** Invariant forbids
  domain data in zustand and the layout-mounted player has no page data → resolve
  the active `Song` from `activeId` via `useGetSongById`. `isPlaying`/`position`/
  `volume` are local to `PlayerContent`, never the store.
- **Cover art wired now** in BOTH the grid (`SongItem`) and the player
  (`PlayerContent`). No `next.config.ts` change — Supabase Storage host
  (`/storage/v1/object/public/**`) already whitelisted in features 03/05.
- **Click model = hover Circular Play button** (canonical Spotify), card also
  clickable. `SongGrid` became a client component to host `useOnPlay`.
- **Strict 09/10 split kept.** 09 = play/pause/seek/volume + clickable songs +
  queue plumbing. **Next/prev buttons render but are INERT** (no handler, TODO
  comments); `onend` only stops — auto-advance + queue-walking are Feature 10.
- **No React Query yet** (deferred to Feature 11); `useGetSongById` is a plain effect.
- No new deps, no migration. `use-sound@5` returns `[play, { pause, sound,
  duration }]`; `sound` is the Howl (`seek()`/`duration()`/`volume()`).

## Problems solved

- **React 19 `react-hooks/set-state-in-effect` lint error** in `useGetSongById`:
  a *synchronous* `setState` in the `!id` early-return branch trips the rule (a
  setState after `await` does not). **Fix: move ALL setState into the async
  `run()` invoked via `void run()`** — deferred, so the rule passes. (Same rule
  bit features 04/05; remember it for any new effect that sets state.)
- **Stale dev-server port confusion (recurring).** Always start a clean instance
  on an explicit port (`PORT=3077 npm run dev`), parse the bound port from the
  log, test, then kill only that port (`lsof -ti tcp:PORT | xargs kill`). Don't
  trust port 3000.

## Current state

- **Feature 09 fully working.** `npm run lint` clean; `npm run build` green (`/`
  + `/library` both `ƒ (Dynamic)`; build still prints `ƒ Proxy (Middleware)`).
  Headless: anon `/` → 200 with idle player + (when empty) "No songs yet."; anon
  `/library` → 307 → `/`. **User-confirmed live:** click→play, pause, seek,
  volume, mute, persistence across nav, anon public playback, cover art — all good.
- Catalog now has real song(s) again (user uploaded during the live test, which
  also cleared the long-pending 07→08 round-trip).
- **All 09 changes are UNCOMMITTED on `main`.** Phases 1–3 done; Phase 4 = 09 done, 10 next.
- Supabase MCP available (project ref `vgsiwqrovctitxkruwpj`). User runs their own
  `npm run dev` (port 3000) — it may be running in the background.

## Next session starts with

1. **Commit decision (UNANSWERED — user was asked, didn't answer before /remember
   save).** Proposed message (phase.feature convention): **`3.9-persistent-player`**.
   **NEVER add a co-author** (global CLAUDE.md). Confirm whether to commit or the
   user will.
2. **Feature 10 — Queue, next & previous** (Phase 4, second/last). Per CLAUDE.md
   read `context/` first; consider `/architect`. Plumbing already exists:
   `usePlayer.ids` is set on every play by `useOnPlay`. Work is mostly in
   `PlayerContent`: implement `onPlayNext`/`onPlayPrevious` (find `activeId` index
   in `ids`, advance/retreat with **wrap-around**), wire them to the existing
   (currently inert) prev/next buttons, and set `onend → onPlayNext` for
   auto-advance. Both buttons have `TODO(Feature 10)` markers in the code.

## Open questions

- Commit 09 now as `3.9-persistent-player`, or user commits himself?
- Cross-user visibility-gated INSERT (`liked_songs`/`playlist_songs` "song must be
  visible") still NOT runtime-tested — needs a 2nd real auth user + sessions.
  Lands in Features 11/14.
- Home "owner sees own private songs" deviation still stands (accepted feature 08;
  revert = add `.eq('is_public', true)` to `getSongs`).
