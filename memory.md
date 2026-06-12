# Memory — Feature 16 Deploy to Render (PROJECT COMPLETE)

Last updated: 2026-06-12

## What was built

**Feature 16 (Phase 8, Deploy to Render) — DONE + LIVE + user-verified ("everything
working fine"). This completes the entire build plan: 16/16 features.** The app is
live at **https://spotifyagain.onrender.com** (Render Node Web Service, free plan).

Committed + pushed to `origin/main`:
- `26f097e 6.16-deploy-to-render` — in-repo deploy artifacts:
  - `.nvmrc` = `22` and `package.json` `engines.node >=20.9.0` (pin Render's Node;
    local is Node 26).
  - `render.yaml` blueprint (runtime node, branch main, build `npm install && npm run
    build`, start `npm run start`, the 3 `NEXT_PUBLIC_*` envVars as `sync:false` so
    values stay in the dashboard). Free plan note: cold-start ~50s after idle.
- `5c9f23e fix(auth): redirect OAuth callback to NEXT_PUBLIC_SITE_URL` — the prod OAuth fix
  (see Problems solved). Touched `src/app/auth/callback/route.ts` + `context/code-standards.md`.

**UNCOMMITTED (user declined the auto-commit):** `context/progress-tracker.md` (Feature 16
ticked complete + decisions appended) and this `memory.md`. I tried to commit them as
`docs: mark Feature 16 complete …` and the user **rejected** the commit — so the docs are
staged-but-not-committed in the working tree. Next session: ask how they want these handled
(commit themselves / different message / leave as-is) rather than auto-committing. NO co-author
on any commit (global CLAUDE.md rule).

## Decisions made

- **Reused the existing Supabase project `vgsiwqrovctitxkruwpj` for prod (USER-CHOSEN).**
  → no migration re-run, no bucket recreation, no Google Cloud OAuth change, and
  `next.config.ts` image host already matched. Only Supabase Auth URL config needed the
  Render origin added.
- **`NEXT_PUBLIC_SITE_URL` is build-time inlined** (read only in `AuthModal.tsx`). On Render it
  must be set to `https://spotifyagain.onrender.com` (NO trailing slash) AND the service
  rebuilt — a restart won't re-bake a `NEXT_PUBLIC_*` var.
- Skipped `/architect` for deploy (mostly external dashboard work); committed deploy artifacts
  directly to `main` (matching prior features). **But the user prefers to control the docs/
  completion commit themselves — don't auto-commit docs without asking.**

## Problems solved

- **PROD-ONLY OAuth redirect bug (the big one).** Sign-in completed but redirected to
  `https://localhost:10000`. **Root cause:** the callback used `new URL(request.url).origin`;
  behind Render's reverse proxy `request.url` carries the INTERNAL bind host (`localhost:10000`
  = Render's default `PORT`), so the post-exchange redirect went there. Auth itself never failed
  — the client's `redirectTo` was always correctly baked to the onrender origin; only the final
  hop used the wrong origin. **Fix:** `const base = process.env.NEXT_PUBLIC_SITE_URL ?? origin`,
  applied to all 3 redirects in `src/app/auth/callback/route.ts`. Documented the gotcha in
  `code-standards.md` (callback snippet + a "never redirect to `request.url` origin in a proxied
  deploy" rule). Server-side change → just needs redeploy, NOT a NEXT_PUBLIC rebuild.
- **Verifying the SITE_URL bake headlessly:** grepped the served `/_next/static/chunks/*.js` for
  `spotifyagain.onrender.com` — confirmed it was inlined (so OAuth `redirectTo` was correct).

## Current state

- **Live + fully working at https://spotifyagain.onrender.com.** User confirmed anon browse/play,
  Google sign-in (post-fix), upload, like, playlist create/add/reorder/play, and responsive all work.
- Headless prod checks (curl) green: `/` 200 (renders the public song → prod env vars + server read OK),
  `/search` 200 (public), `/library` `/liked` `/playlist/[id]` → 307 → `/` (proxy gating live).
- `main` is at `5c9f23e` (pushed). Working tree has the **uncommitted** progress-tracker + memory
  updates (the user declined committing them).
- Supabase MCP available (project `vgsiwqrovctitxkruwpj`). Context7 available.

## Next session starts with

1. **Ask the user how to handle the uncommitted docs** (`context/progress-tracker.md` + `memory.md`) —
   they declined an auto-commit this session. Don't commit without their go-ahead.
2. **The build plan is DONE (16/16).** Anything further is out-of-scope of `build-plan.md`. Candidate
   polish if asked:
   - **Seed 3–6 public demo songs** (catalog has only **1** public song — thin for a recruiter's first
     impression). Must be uploaded via the app's upload flow (audio+cover → Storage); NOT MCP-seedable.
   - Optional: bump Render free → Starter to kill the ~50s cold start.
   - Optional: a README polish / project write-up for the portfolio.

## Open questions

- **How does the user want the completion docs committed?** (declined the auto-commit — pending.)
- Still untested (needs a 2nd real auth user, not single-account testable): cross-user negative RLS
  paths — visibility-gated INSERTs on `liked_songs`/`playlist_songs`, reorder/remove on a non-owned
  playlist, cross-user `/playlist/[id]` + search visibility. All validated structurally in Feature 06.
- Accepted deviation still stands (Feature 08): a signed-in user sees their own private songs on Home
  and in their own `/search` results (same RLS) — correct/expected, not a leak to other users.
