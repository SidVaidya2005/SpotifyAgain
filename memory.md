# Memory — Phase 11 Sectioned Home built (+ demo catalog seeded earlier this session)

Last updated: 2026-06-13

## What was built / done this session

Two things shipped this session: (1) seeded the demo catalog, (2) built Phase 11 Sectioned Home.

### 1. Demo catalog seeded — DONE & verified
- Catalog went **1 public song → 19** (20 total; the 20th is a pre-existing private song). All 18
  royalty-free tutorial clips uploaded to Supabase Storage + inserted as public `songs` rows.
- **`scripts/seed-songs.mjs`** (new) — local seeder (`.mjs`, run via `npm run seed:songs` =
  `node --env-file=.env.local`; project has NO TS runner, so no `.ts`). Resolves uploader by email
  (`auth.admin.listUsers`, `SEED_USER_EMAIL` default `siddarthvaidya2005@gmail.com`), uploads MP3+cover
  under `<user_id>/<uuid>.<ext>`, inserts rows `is_public:true` via **service-role key** (bypasses RLS).
  Idempotent on `(title, author)`; mirrors the app's upload-cleanup invariant.
- **Relabeled 3 neon tracks → "Night Runners"** (3-track cluster) so #20 ("more like this"/shuffle) is
  demoable. Verified in DB (project ref `vgsiwqrovctitxkruwpj`): 20 songs, 19 public, Night Runners=3.
- Supporting: `package.json` (+`seed:songs`), `.env.example` (documented service-role key + SEED_USER_EMAIL),
  `.gitignore` (+`/Songs`). **`Songs/` local asset folder was then DELETED** (user asked) — so the seeder
  can't be re-run until those 18 clips+covers are re-fetched into `Songs/public/{songs,cover-images}/`.
  The 3 top-level `Songs/*.mp3` were **copyrighted Bollywood tracks — excluded from seed, never deploy.**

### 2. Phase 11 — Sectioned Home (feature 26) — BUILT, anon-verified, NOT yet committed/owner-verified
- **`src/app/(site)/page.tsx`** (rewritten): Home is now labeled shelves, not one flat grid.
  "Recently added" (newest 12, everyone) + signed-in-only "Made by you" (getSongsByUser, showVisibility)
  + "Liked songs" (getLikedSongs) — both hidden when empty — + "Browse by artist" (author-grouped rows).
- **`src/server/optional-user.ts`** (new): `getOptionalUser()` → `User | null`, **never redirects**
  (the public-page counterpart to `requireUser`).
- **`src/lib/artists.ts`** (new): pure `groupSongsByAuthor(songs, minSongs=2)` → only authors with ≥2
  songs get a shelf (today: Night Runners ×3); single-song artists stay in "Recently added".
- Reused unchanged: `SongGrid`, `SongItem`, `getSongs`, `getSongsByUser`, `getLikedSongs`.
- Docs updated: `build-plan.md` (Phase 11, count 25→26), `progress-tracker.md` (checklist #26 unchecked,
  status, durable decisions). Approved plan: `~/.claude/plans/zany-gathering-peacock.md`.

## Decisions made

- **No external music API / "Made for you".** Storage isn't the constraint (~20MB used). An API catalog
  would gut the portfolio's point (uploads+Storage+RLS) and Spotify/Apple/YouTube can't do anon full
  playback anyway. "Made for you"/recommendations/trending are **out of scope** AND we have no
  signal (no play history/genre) to make them honest — so Home sections use **real data only**
  (recency/author/ownership). If a big library is ever wanted: optional hybrid Audius/Jamendo import
  ON TOP of uploads (future Phase 12), not a replacement.
- **Artists = author-grouped song rows** (user chose this over clickable cards), with a **≥2-song
  threshold** to avoid 16 one-card shelves.
- **Include signed-in personal shelves** on Home (Made by you / Liked songs), conditional + hidden when empty.
- **`getOptionalUser` not `requireUser`** for public pages with signed-in sections — using requireUser
  would bounce anon visitors off Home.

## Problems solved

- `Songs/` was not gitignored (would've committed 20MB + copyrighted tracks to the PUBLIC repo) — added `/Songs`.
- No TS runner → seeder written as `.mjs` + Node `--env-file` (no new dep).
- Owner had to add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` (done); seeder fails fast if absent.

## Current state

- **Seeder ran: 18 created, 0 failed.** Live Render site already shows 19 songs (catalog read at runtime
  from Supabase — no redeploy needed).
- **Phase 11: `npx tsc --noEmit` + `npm run lint` both clean.** Anonymous Home verified via curl: renders
  "Recently added" + "Browse by artist"→"Night Runners" (3 tracks), personal shelves correctly hidden.
- **Dev server is RUNNING in background** (shell ID `bxml9ot4j`, output at
  `/private/tmp/claude-501/.../tasks/bxml9ot4j.output`) at http://localhost:3000 — left up so owner can
  verify the SIGNED-IN view. Healthy (`✓ Ready`, no errors).
- **UNCOMMITTED on `main`:** the seed work (`scripts/seed-songs.mjs`, `.gitignore`, `package.json`,
  `.env.example`) + Phase 11 (`page.tsx`, `optional-user.ts`, `artists.ts`, `build-plan.md`,
  `progress-tracker.md`). `.env.local` + `Songs/`(deleted) are gitignored. Owner controls commits.

## Next session starts with

1. **Owner live-verifies the SIGNED-IN Home view** at http://localhost:3000 (dev server `bxml9ot4j` is up):
   confirm "Made by you" (all 19 for the owner, with badges) + "Liked songs" (after liking something)
   appear. Then **flip #26 to ✅** in `progress-tracker.md` + `build-plan.md`.
2. **Live-verify #20** (play bar shuffle + "more like this") against the Night Runners cluster — the last
   other unchecked box.
3. **Commit** the uncommitted seed + Phase 11 work (owner's call on timing/branching).

## Open questions

- Leave the dev server (`bxml9ot4j`) running or stop it? (Left running for owner verification.)
- When to commit, and how to group the commits (seed vs Phase 11) — owner decides.
- Still outstanding from before: **`/imprint` the post-v1 + v2 + Phase 11 components** into
  `ui-registry.md` (only `PortfolioLinks` + `pb-24` recorded so far). Optional: Render free→Starter (cold
  start), README/portfolio write-up.
