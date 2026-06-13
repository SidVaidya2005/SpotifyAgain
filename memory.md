# Memory — Demo catalog seeded (1 → 19 public songs)

Last updated: 2026-06-13

## What was built / done this session

- **Seeded the demo catalog — DONE & verified.** Catalog went from **1 public song → 19** (20 total;
  the 20th is a pre-existing private song). All 18 royalty-free demo clips uploaded to Supabase Storage
  + inserted as public `songs` rows owned by the owner account.
- **New file `scripts/seed-songs.mjs`** — one-time local seeder (`.mjs`, not `.ts`, because the project
  has NO TS runner and we won't add one for a local admin task; run with Node's native `--env-file`).
  - Resolves the uploader's `user_id` from email via `supabase.auth.admin.listUsers()`
    (`SEED_USER_EMAIL`, defaults to `siddarthvaidya2005@gmail.com`).
  - For each of 18 clips: uploads MP3 → `songs` bucket + cover → `images` bucket under
    `<user_id>/<uuid>.<ext>`, then inserts a `songs` row `is_public: true`.
  - **Idempotent** on `(title, author)` — re-runs skip existing. Mirrors the app's upload-cleanup
    invariant (removes orphaned Storage objects on a mid-way failure). Uses the **service-role key**
    (bypasses RLS) — architecture-sanctioned local seed task.
- **`package.json`** — added script `"seed:songs": "node --env-file=.env.local scripts/seed-songs.mjs"`.
- **`.gitignore`** — added `/Songs` (the local asset folder). Was NOT ignored before → the 20MB of
  assets + 3 copyrighted tracks were about to be committed to the PUBLIC repo. Now safe.
- **`.env.example`** — documented `SUPABASE_SERVICE_ROLE_KEY` (now needed for the seeder) + optional
  `SEED_USER_EMAIL`.
- **`context/progress-tracker.md`** — flipped the seeding bullet to ✅ DONE with the details.

## Decisions made

- **Did NOT use an external music API** (Spotify/Audius/Jamendo). Reasoning: storage is NOT the
  constraint (18 clips ≈ 20MB ≈ 0.4% of the shared 5GB free tier); and replacing the catalog with an API
  would gut the portfolio's whole point (uploads + Storage + RLS ownership are what it demonstrates).
  Spotify/Apple/YouTube also can't do anonymous full playback anyway (previews-only / subscriber-gated /
  ToS). If a "big library" is ever wanted, do it as an OPTIONAL hybrid import feature ON TOP of uploads
  (its own future Phase 11), not a replacement.
- **Author relabel for #20:** the source data (`Songs/seeds/songs.js`) gives every track a unique
  artist, so same-author queueing would surface nothing. Relabeled 3 neon-themed tracks (Neon Lights,
  Neon Dreams, Neon Tokyo) → **"Night Runners"** to create one 3-track author cluster. Verified in DB:
  Night Runners = 3.
- **The 3 top-level `Songs/*.mp3` (Bollywood: Shararat-Dhurandhar, Aari Aari, Bairan-Banjaare) are
  copyrighted — EXCLUDED from the seed; never deploy publicly.** Only the 18 tutorial clips were seeded.
- Workflow standing rule still in force: update the plan/progress doc before/after coding (done).

## Problems solved

- **`Songs/` was not gitignored** — caught before any commit; added `/Songs` to `.gitignore`. Confirmed
  via `git check-ignore`.
- **No TS runner** in the project → wrote the seeder as `.mjs` + `--env-file=.env.local` (Node 26) so no
  new dependency was needed.
- User had to add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` (was absent); script fails fast with a
  clear message if it's missing. Key is now added.

## Current state

- **Seeder ran successfully: created 18, skipped 0, failed 0.** DB verified via Supabase MCP
  (project ref `vgsiwqrovctitxkruwpj`): 20 total songs, 19 public, 18 distinct authors, Night Runners=3.
- The live Render site **already shows the 19 songs** (catalog is read at runtime from Supabase — no
  redeploy needed).
- **UNCOMMITTED on `main`:** `scripts/seed-songs.mjs` (new), `.gitignore`, `package.json`, `.env.example`,
  `context/progress-tracker.md`. `.env.local` + `Songs/` are gitignored (key + copyrighted tracks safe).
  Owner controls commits — not yet committed.

## Next session starts with

1. **Live-verify feature #20** (play bar — shuffle + "more like this") against the now-seeded **Night
   Runners** 3-track cluster: on a Night Runners song, "More like this" should queue the other 2; shuffle
   should have a real queue. If it works → flip **#20 to ✅** in `progress-tracker.md` + `build-plan.md`
   (it's the LAST unchecked feature box; everything else is done).
2. **Commit** the uncommitted seed work (owner's call on timing / branch).

## Open questions

- **When to commit** the seed work, and whether to bundle with the #20 verification flip — owner decides.
- **`/imprint` the post-v1 + v2 components** into `ui-registry.md` still outstanding (Tooltip, player
  shuffle/more-like-this, Header, `SongItem` hover-lift, `HeaderSearch` dropdown, fixed app-shell, green
  glow, anon sign-in-prompt nav) — only `PortfolioLinks` + the `pb-24` rule recorded so far.
- Optional: bump Render free → Starter to kill the ~50s cold start; README / portfolio write-up.
