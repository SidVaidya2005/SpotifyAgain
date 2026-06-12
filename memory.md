# Memory — Feature 11 Like / unlike & Liked Songs

Last updated: 2026-06-12

## What was built

Feature 11 (Phase 5, Library & Likes) — **built + lint/build green + LIVE-VERIFIED
in the browser (user-confirmed 2026-06-12, "verified everything working fine").**
This was **React Query's debut** in the codebase (installed since scaffold, mounted
nowhere until now). **Phase 5 Feature 11 complete; Feature 12 is next.**

**All of Feature 11 is UNCOMMITTED on `main`** (HEAD is still
`69c8f26 3.10-queue-next-previous`). 7 new files + 5 modified (+ `progress-tracker.md`
and this `memory.md`).

New files:
- `src/providers/ReactQueryProvider.tsx` — `'use client'`, `useState(() => new
  QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } }))`. Verbatim
  from `library-docs.md`.
- `src/actions/toggle-like.ts` — Server Action, verbatim from `code-standards.md`
  § Server Action: `getUser()` re-check → `maybeSingle()` existence check on
  `(user_id, song_id)` → delete-if-present-else-insert → `revalidatePath('/liked')`
  → returns `{ data: { liked: boolean } }`.
- `src/hooks/useLikedSongs.ts` — React Query `useQuery({ queryKey: ['liked-songs'],
  enabled: !!user })`, **browser** Supabase client, `select('song_id').eq('user_id',
  user.id)` → `string[]` of liked song ids. Anon → disabled → [] → outline hearts.
- `src/hooks/useToggleLike.ts` — **optimistic** `useMutation`: `onMutate`
  cancelQueries + snapshot + flip the cached id list; `onError` rollback +
  `toast.error`; `onSettled` invalidate `['liked-songs']`. Unwraps ActionResult,
  throws on `{ error }`.
- `src/components/LikeButton.tsx` — `FiHeart`, filled `fill-accent text-accent`
  when liked / `fill-none text-muted` outline otherwise. Props `{ songId, className,
  revealOnHover }`. Anon click → `useAuthModal().onOpen()`; signed-in → `mutate()`.
  `stopPropagation` so it never triggers card-play. `revealOnHover` hides the card
  heart until hover **unless already liked** (liked hearts always show).
- `src/server/get-liked-songs.ts` — `from('liked_songs').select('songs(*)')
  .eq('user_id', userId).order('created_at', { ascending: false })
  .returns<{ songs: Song }[]>()` → maps to `Song[]` (newest like first).
- `src/app/(site)/liked/page.tsx` — `requireUser()` → `getLikedSongs(user.id)` →
  `SongGrid` (empty: "Songs you like will appear here.").

Modified:
- `src/app/layout.tsx` — `<ReactQueryProvider>` mounted **just inside
  `<UserProvider>`, wrapping the entire tree** (shell + `<PlayerBar/>` +
  `<BottomNav/>`) so card hearts and the player heart share one cache.
- `src/components/SongItem.tsx` — `<LikeButton songId={song.id} revealOnHover
  className="absolute right-1 top-1" />` in the cover overlay (top-right; play
  button stays bottom-right).
- `src/components/player/PlayerContent.tsx` — `<LikeButton songId={song.id} />` in
  the left cluster, always visible. **PlayerBar untouched** — PlayerContent already
  receives the full `song`, so it just reads `song.id`.
- `src/components/Sidebar.tsx` + `src/components/BottomNav.tsx` — append
  `{ label: 'Liked Songs', href: '/liked', icon: FiHeart }` to nav **only when
  `useUser()` has a user**.

`/architect` plan: `~/.claude/plans/logical-plotting-frog.md`.

## Decisions made (all via /architect, user-chosen)

- **Heart placement = song cards + player bar.** Both render the same `LikeButton`.
- **Optimistic toggle** (flip instantly, rollback on error) over invalidate-on-success.
- **Nav entry = signed-in only** (hidden for anon). Existing always-visible "Library"
  entry deliberately left as-is (minor pre-existing inconsistency, out of scope).
- **React Query for hearts, not server-revalidate.** Honors architecture.md
  (Feature 11 mounts React Query, key `['liked-songs']`). `/liked` page is still a
  Server Component read; `toggleLike` also `revalidatePath('/liked')` so it stays
  correct after navigation.
- One shared `['liked-songs']` query of *ids* powers every heart (React Query dedupes
  by key) — NOT per-song queries, NOT initial state threaded from the server.

## Problems solved

- **Embed type mis-inference (build failure → fixed).** `from('liked_songs')
  .select('songs(*)')` is many-to-one but the generated types infer the embedded
  `songs` as `any[]`, so `.map(r => r.songs)` produced `any[][]` and `tsc` failed
  (`Type 'any[][]' is not assignable to ... Song[]`). Fix: `.returns<{ songs: Song
  }[]>()` (idiomatic Supabase type override — NO `any`, NO `as`-cast). PostgREST
  returns one song object per like row at runtime, so this matches reality.
- **`.next` contention:** running `npm run build` while the user's `npm run dev` is
  alive shares `.next` and can disrupt the dev server — needs a dev restart before a
  live run (user restarted; task id `bj0xywm00`). Verified v5 optimistic pattern
  against Context7 `/tanstack/query` before writing `useToggleLike`.

## Current state

- **Feature 11 built; `npm run lint` clean; `npm run build` green** (`/`, `/library`,
  **`/liked`** all `ƒ (Dynamic)`; build still prints `ƒ Proxy (Middleware)`).
- **LIVE-VERIFIED (user-confirmed):** like from a card → heart fills instantly →
  `/liked` lists it; unlike removes it; player-bar heart reflects + toggles the active
  track in sync; anon heart click → AuthModal; "Liked Songs" nav signed-in-only;
  playing from `/liked` sets the queue to the liked list.
- The visibility-gated `liked_songs` INSERT `with check` runs on every like — the
  **positive** path (liking a *visible* song) is now exercised; the **negative** path
  (blocked when a song isn't visible) is still NOT UI-triggerable.
- Phases 1–4 done + live-verified. Phase 5: **11 done**, 12 next.
- Supabase MCP available (project ref `vgsiwqrovctitxkruwpj`). User runs their own
  `npm run dev` (port 3000).

## Next session starts with

1. **Commit Feature 11** if not already done. Convention is `phase.feature`:
   proposed **`5.11-like-unlike-liked-songs`**. **NEVER add a co-author** (global
   CLAUDE.md). Confirm whether to commit or the user will.
2. **Phase 5 — Feature 12: Library polish.** Per CLAUDE.md read `context/` first;
   consider `/architect`. Build-plan §12 scope (items deferred from Feature 08):
   - Library page shows a **public/private indicator** badge on the user's own uploads.
   - A dedicated **Library upload entry point** (currently the only upload affordance
     is the signed-in "+" in the `Header`; §12 may add/duplicate one on `/library`).
   - A **polished empty state** when the user has no uploads (current is a minimal
     `SongGrid` `emptyMessage`).
   - Reuse `get-songs-by-user.ts`; ensure newly uploaded songs appear immediately.
   Reusable now: `LikeButton`, `SongGrid`/`SongItem`, React Query infra,
   `requireUser()`, `Button` primitive (`pill`/`white`/`outline`).

## Open questions

- Commit Feature 11 now (`5.11-like-unlike-liked-songs`), or user commits himself?
- Cross-user visibility-gated INSERT **negative** path (`liked_songs`/`playlist_songs`
  "song must be visible") still NOT runtime-tested — needs a 2nd real auth user + a
  private song + live sessions. Positive path is now covered (Feature 11).
- Home "owner sees own private songs" deviation still stands (accepted Feature 08;
  revert = add `.eq('is_public', true)` to `getSongs`).
