# Memory — Feature 06 Database schema & storage

Last updated: 2026-06-12

## What was built

Feature 06 (Phase 3, first feature) — **built and verified**. All changes are
**uncommitted** on `main`.

New files:
- `supabase/migrations/20260612015610_catalog_schema_and_storage.sql` — one additive
  migration. Creates `public.songs`, `public.playlists`, `public.playlist_songs`,
  `public.liked_songs` with columns + RLS from `architecture.md`; FK indexes; and the
  `songs` + `images` Storage buckets (`insert into storage.buckets ... public=true`)
  with `storage.objects` policies (public read; owner insert/update/delete scoped to
  `(storage.foldername(name))[1] = (select auth.uid())::text`). Matches the Feature 05
  SQL style: `-- ====` / `-- ----` dividers, `(select auth.uid())` subselect wrapping,
  plain `create table`. **`profiles` is NOT touched** (already exists from 05).
  - songs RLS: SELECT (no `to` → all roles incl. anon) `using (is_public or own)`;
    INSERT/UPDATE/DELETE `to authenticated`, owner-only. `song_path`/`image_path` are
    **NOT NULL**.
  - playlists: single `for all to authenticated` owner policy.
  - playlist_songs: SELECT/UPDATE/DELETE gated on parent-playlist ownership via
    `exists(...)`; INSERT additionally requires the song be visible (`is_public or own`).
  - liked_songs: composite PK `(user_id, song_id)`; SELECT/DELETE owner-only; INSERT
    requires `user_id = uid` AND song visible.
- `src/types/database.types.ts` — generated from the live schema via Supabase MCP
  `generate_typescript_types`.

Modified:
- `src/types/index.ts` — replaced the hand-written `interface Song` with aliases derived
  from generated Row types: `Song`, `Playlist`, `PlaylistSong`, `LikedSong`, `Profile`
  (`Database['public']['Tables'][...]['Row']`). `ActionResult` unchanged.
- `context/progress-tracker.md` — 06 checked off; status → "Phase 3 in progress, 07 next";
  full decision log appended.

Approved plan: `/Users/siddarthvaidya/.claude/plans/yes-changes-are-already-wiggly-clock.md`.

## Decisions made

- **Storage buckets created IN the migration** (not the dashboard) so
  `supabase/migrations/` stays the single source of truth (invariant). Buckets are
  public-read = "unlisted" privacy only; object URLs are NOT access-controlled (per
  architecture.md — `is_public` only hides private rows from the catalog via RLS).
- **`songs.song_path` / `image_path` are NOT NULL** — every song needs audio + cover, and
  this keeps the generated `Song` field types `string` (not `string | null`) so the
  existing `MOCK_SONGS` + grid/card components type-check with zero changes.
  `playlists.description` / `image_path` stay nullable.
- **`Song` is now a generated-type alias**, not a hand-written interface. Regenerate
  `database.types.ts` after every future migration.
- **Applied via Supabase MCP this session** — MCP auth WAS available (unlike Feature 05's
  dashboard fallback). `apply_migration` → `{"success":true}`.
- Indexes added on FK columns (`songs.user_id`, `playlists.user_id`,
  `playlist_songs.playlist_id`/`song_id`, `liked_songs.song_id`) — FK hygiene, silences
  the Supabase unindexed-FK advisor.

## Problems solved

- **Supabase MCP is usable this session** (project ref `vgsiwqrovctitxkruwpj`,
  ACTIVE_HEALTHY). `list_projects`/`apply_migration`/`execute_sql`/`get_advisors`/
  `generate_typescript_types` all worked. (Feature 05's session couldn't surface them — no
  longer a blocker, but if a future session can't, the Dashboard SQL Editor fallback still
  works since the `.sql` is committed.)
- **`execute_sql` multi-statement returns only the LAST statement's result** — run
  structural checks as single statements (or put the meaningful SELECT last).
- **RLS role testing via `set role anon` works** inside a DO block for write-rejection
  probes (confirmed anon insert into songs is blocked).

## Current state

- **Feature 06 done + verified.** `npm run lint` + `npm run build` green (build still prints
  `ƒ Proxy (Middleware)`; `/` `ƒ (Dynamic)`).
- **Migration APPLIED** to project `vgsiwqrovctitxkruwpj`. Verified: all 4 tables
  `relrowsecurity=true` with policy counts songs 4 / playlist_songs 4 / liked_songs 3 /
  playlists 1; `get_advisors` (security) shows **no warnings on the 4 new tables** (only
  pre-existing lints: 05's `handle_new_user` SECURITY DEFINER RPC-exposure + Auth
  leaked-password — neither from 06, both left as-is/out of scope); both buckets
  `public=true`; anon insert into `songs` correctly rejected by RLS.
- **Phases 1 + 2 + Feature 06 done.** Catalog is still **mock data** in the UI
  (`src/app/(site)/page.tsx` `MOCK_SONGS`) — real reads are Feature 08, not 06.
- **All Feature-06 changes uncommitted** on `main` (latest commit `3c9764f
  2.5-action-gating-profiles-signout`).

## Next session starts with

1. **Commit decision (UNANSWERED).** Proposed message per repo convention (phase.feature):
   **`3.6-catalog-schema-and-storage`**. **Never add a co-author** (global CLAUDE.md).
   Confirm whether to commit or the user will.
2. Then **07 Upload song flow** (Phase 3). Per CLAUDE.md read `context/` first. Scope:
   `UploadModal` (react-hook-form: title, author, audio file, image file, **public/private
   toggle defaulting to public**, loading/disabled states); client uploads both files to
   Storage under `<user_id>/<uuid>.<ext>` then calls a new **`createSong` Server Action**
   (`src/actions/create-song.ts`) to insert the row — full pattern already written out in
   `context/library-docs.md` → "Upload". On any post-upload failure the client deletes the
   orphaned object(s). Validate file types against `ACCEPTED_AUDIO_TYPES`/
   `ACCEPTED_IMAGE_TYPES` in `src/lib/constants.ts`; `toast` success/failure; `reset()` +
   close + `router.refresh()` on success. Needs a `use-upload-modal` Zustand store and an
   upload trigger (likely in the Library/Header). DB types + `Song` alias are ready.

## Open questions

- Commit 06 now as `3.6-catalog-schema-and-storage`, or user commits himself?
- For 07: where does the "upload" entry point live? Build-plan says Library, but `/library`
  page doesn't exist yet (Feature 08/12 flesh it out). May need a minimal trigger now
  (e.g. a "+" in the sidebar/Header) and full Library polish later. Decide at 07 start.
- The cross-user visibility-gated INSERT (`liked_songs`/`playlist_songs` "song must be
  visible") is validated structurally + via Context7 but NOT runtime-tested (needs a 2nd
  real auth user + data + sessions). Real coverage lands in Features 08/11 — verify there.
