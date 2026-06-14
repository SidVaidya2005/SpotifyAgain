# Memory — Context reconciliation + dropped ui-registry

Last updated: 2026-06-14

## What was done this session

A **documentation-only** session — no app code touched. Audited every `context/` doc against
the real codebase, fixed the drift, and removed the unused UI registry. All changes are
**uncommitted** in the working tree (only `context/*` + the deleted root file are modified).

### 1. Context reconciliation — `context/architecture.md`
Folder-tree section was stamped "Phase 9" and had missed Phases 10–11. Fixed:
- Status banner "Phase 9" → "Phase 9–11 enhancements".
- **Added** to the tree: root `README.md` (a 2-line stub), `scripts/seed-songs.mjs`,
  `src/server/optional-user.ts`, `src/lib/artists.ts`.
- **Removed** `SearchInput.tsx` (deleted back in feature 24, but still listed).
- `next.config.ts` note now mentions the **Google avatar host** (`lh3.googleusercontent.com`) +
  turbopack root, not just the Supabase Storage host (2 places: tree comment + Deployment bullet).
- **Added the green-glow tokens** `--shadow-glow` / `--shadow-card-glow` to the verbatim `@theme`
  block (feature 25 added them to `globals.css`; the doc's reproduction had omitted them).

### 2. Context reconciliation — `context/progress-tracker.md`
- Fixed **stale commit status**: it said the Phase 11 + seed work was "uncommitted on main", but
  git shows it's committed (#26 in `c25256d`, seed script in `9a9a80a`; working tree clean).
  Left the live-verify-pending status for #20 / #26 intact (those genuinely are still pending).

### 3. Dropped `ui-registry.md`
- **Deleted** the root `ui-registry.md`. Reason: it recorded only 1 of ~25 components
  (`PortfolioLinks`) while claiming to be a "read before building any UI" reference — net
  misleading. The real visual source of truth is `context/DESIGN-spotify.md` + the `@theme`
  tokens in `globals.css`; the registry was a derived convenience layer never populated.
- Cleaned its references out of the **active context**: removed the folder-tree line in
  `architecture.md` and both `/imprint … into ui-registry.md` mentions in `progress-tracker.md`
  (the "Next" clause + the out-of-scope-polish bullet). The old imprint TODO is now obsolete.

## Decisions made

- **Reconcile, don't rewrite.** The context docs were kept impressively current; this was
  surgical drift-fixing, not an overhaul. Verified the rest is accurate rather than rewriting it.
- **Dropped ui-registry.md instead of populating it** (the alternative was `/imprint audit`).
  Project is feature-complete (26/26 built) and in polish/portfolio mode, not active UI
  expansion, so a component registry doesn't earn its keep. `DESIGN-spotify.md` is authoritative.
- **Left history + auto-snapshots alone.** `context/build-journal.md` (verbatim historical log,
  "not read at session start") still mentions ui-registry/imprint — left intact because rewriting
  history reduces its value and the `pb-24` rule survives in progress-tracker durable decisions.
  This `memory.md` overwrite naturally drops the old imprint TODO it used to carry.

## Problems solved / verified

- **Full content audit passed**: data model ↔ both migration SQLs, all Key-Pattern snippets
  (`server.ts`, `middleware.ts`, `proxy.ts`, `use-player`, `get-songs`, `@theme` block), boundary
  patterns (`toggle-like`, `search-songs`, `create-song`), approved deps ↔ `package.json`, and the
  Phase 9/10/11 features (`layout.tsx` fixed shell, sectioned Home) all **match the code**.
- **`npx tsc --noEmit` + `npm run lint` both clean** (validated the tracker's build-status claim).
- Doc-tree edits failed twice on whitespace at first — the component/server tree lines use a
  single-pipe indent (`    │   ├──`), not double. Re-read then matched. (Non-issue now.)

## Current state

- Context docs (`project-overview`, `architecture`, `code-standards`, `DESIGN-spotify`,
  `library-docs`, `build-plan`, `progress-tracker`) are **fully reconciled with the codebase.**
  The other 5 needed no changes — only `architecture.md` + `progress-tracker.md` were edited.
- **Uncommitted on `main`:** `context/architecture.md`, `context/progress-tracker.md` (modified),
  `ui-registry.md` (deleted). Nothing else. App code untouched, build green.
- App itself unchanged from last session: live at https://spotifyagain.onrender.com, 19 public
  songs seeded (incl. "Night Runners" ×3), Phase 11 Sectioned Home committed (`c25256d`).

## Next session starts with

1. **Commit the doc changes** (owner's call on timing). Suggested message:
   `docs: reconcile context with codebase; drop unused ui-registry`
2. Optional: scrub the remaining ui-registry/imprint mentions in `context/build-journal.md`
   (lines ~531, 589–590) if zero dangling references are wanted — left as history this session.
3. Still pending from before (unchanged, app-level): **live-verify #26** (signed-in Home shows
   "Made by you" + "Liked songs"; anon sees Recently added + Browse by artist→Night Runners) and
   **live-verify #20** (play-bar shuffle + "more like this" against the Night Runners cluster),
   then flip both boxes in `progress-tracker.md` + `build-plan.md`.

## Open questions

- When to commit the doc changes, and whether to fold them into one commit (owner decides).
- Scrub the historical `build-journal.md` ui-registry mentions, or leave as record? (Left as record.)
- The root `README.md` is still a 2-line stub — real portfolio write-up remains a TODO if wanted.
