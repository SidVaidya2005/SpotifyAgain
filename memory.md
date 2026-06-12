# Memory — Feature 10 Queue, next & previous

Last updated: 2026-06-12

## What was built

Feature 10 (Phase 4, final feature) — **built + lint/build green; live browser
run still PENDING** (needs ≥2 public songs; queue logic is not exercisable
headlessly — no audio). Single-file change. Phase 4 — Playback now complete
pending that live check.

Both **Feature 09 AND Feature 10 are UNCOMMITTED on `main`** (latest commit
`d9e9f19 3.8-home-and-library-real-songs`).

Modified (only file):
- `src/components/player/PlayerContent.tsx` — added inline `onPlayNext` (walk
  `usePlayer.ids`, wrap last→first: `ids[i+1] ?? ids[0]`) and `onPlayPrevious`
  (Spotify-style: `sound.seek()` >3s → restart current `sound.seek(0)` +
  `setPosition(0)`; else step back `ids[i-1] ?? ids[ids.length-1]`, wrap to last).
  Wired the previously-inert prev/next buttons (`onClick`), removed their
  `TODO(Feature 10)` comments, and pointed `use-sound`'s `onend` at `onPlayNext`
  (was `() => setIsPlaying(false)`). Added `import { usePlayer } from
  '@/stores/use-player'`.
- `context/progress-tracker.md` — 10 checked off, status updated, full 10 decision
  + verification log appended.

`/architect` plan written to (reused slug) `~/.claude/plans/feature-09-persistent-cozy-boole.md`.

## Decisions made (all via /architect, user-chosen)

- **onend LOOPS.** `onend: onPlayNext` → last track auto-advances to first; queue
  loops endlessly. Manual next wraps too. (Alternative considered: stop-at-end.)
- **Previous is Spotify-style.** >3s into the track → restart it; else go to the
  prior track (wrap first→last). (Goes beyond build-plan's plain "previous + wrap"
  by design.)
- **Handlers read `usePlayer.getState()`** (live store), NOT render-closure
  values, so the `onend` callback use-sound captures at mount always walks the
  current `ids`/`activeId`. Handlers stay inline in `PlayerContent` (no new hook).
  `PlayerContent` still takes title/cover from props — no new store subscription.
- **No repeat/shuffle** (out of scope). No store change (usePlayer already had
  `ids`/`activeId`/`setId`). No new files/deps/migrations.

## Problems solved

- Nothing new/hard this feature. Reused the established Feature-09 remount chain:
  `setId(newId)` → `PlayerBar` (`useGetSongById` → `useLoadSongUrl`) →
  `PlayerContent key={songUrl}` remounts → old Howl unloads on cleanup, new one
  autoplays. `sound.seek()` is typed `number | Howl`; guard with `typeof ===
  'number'` (no cast needed).
- (Carryover reminders, still relevant) React 19 `react-hooks/set-state-in-effect`:
  keep setState out of synchronous effect bodies / inside async fns. Dev-server:
  start on an explicit `PORT` (e.g. `PORT=3077 npm run dev`), don't trust 3000.

## Current state

- **Feature 10 built; `npm run lint` clean; `npm run build` green** (`/` +
  `/library` `ƒ (Dynamic)`; build still prints `ƒ Proxy (Middleware)`).
- **NOT yet live-verified** (no audio headless). Needs a user browser run with
  **≥2 public songs**: next/prev advance + wrap, onend auto-advance + loop at end,
  previous restart-if->3s vs prior-track, and queue follows the launched-from list
  (Home vs `/library`).
- **Known edge:** a single-item queue does NOT replay on `onend` (`setId(sameId)`
  is a no-op → no remount). Accepted.
- Phases 1–3 done; **Phase 4 (09, 10) done pending 10's live check.** Catalog has
  real song(s) (may be only 1 — confirm/upload a 2nd before testing 10).
- Supabase MCP available (project ref `vgsiwqrovctitxkruwpj`). User runs their own
  `npm run dev` (port 3000).

## Next session starts with

1. **Live-verify Feature 10** in the browser (steps above; ensure ≥2 public songs).
2. **Commit decision (STILL UNANSWERED across 2 sessions).** Both 09 + 10
   uncommitted. Proposed messages (phase.feature convention): **`3.9-persistent-player`**
   then **`3.10-queue-next-previous`**. **NEVER add a co-author** (global CLAUDE.md).
   Confirm whether to commit (one or two commits) or the user will.
3. **Phase 5 — Feature 11: Like / unlike & Liked Songs.** Per CLAUDE.md read
   `context/` first; consider `/architect`. This is where **React Query finally
   gets mounted** (`ReactQueryProvider`, deferred since Feature 04). Pieces from
   build-plan/architecture: `LikeButton` (filled/outline heart, prompts AuthModal
   for anon), `toggleLike` Server Action (insert/delete in `liked_songs`,
   re-check `getUser()`), React Query invalidate `['liked-songs']`, `/liked` page
   via `get-liked-songs.ts` + `requireUser()`; playing from `/liked` sets the queue
   to liked songs. NOTE: `liked_songs` INSERT RLS requires the song be visible
   (public OR own) — the cross-user visibility-gated INSERT is still untested.

## Open questions

- Commit 09 + 10 now (`3.9-persistent-player`, `3.10-queue-next-previous`), or user
  commits himself? (Open since the 09 session.)
- Cross-user visibility-gated INSERT (`liked_songs`/`playlist_songs` "song must be
  visible") still NOT runtime-tested — needs a 2nd real auth user + sessions.
  First real exercise lands in Feature 11 (likes).
- Home "owner sees own private songs" deviation still stands (accepted feature 08;
  revert = add `.eq('is_public', true)` to `getSongs`).
