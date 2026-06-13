# Memory — v2 UI changes: #3 search dedupe done, #4 next

Last updated: 2026-06-13

## What was built / done this session

- **v2 #3 — Remove the duplicate search bar on `/search` — ✅ DONE (user-verified live).**
  - `src/app/(site)/search/page.tsx`: removed the `SearchInput` import + `<SearchInput>` render;
    dropped the now single-child `space-y-4` wrapper so `<h1>Search</h1>` sits directly in the page's
    `space-y-8` stack; updated the source-of-truth comment to point at `HeaderSearch`. The `?q=` read,
    `searchSongs`, `getSongs().slice(0,12)` recently-added default, and both `SongGrid` branches are
    unchanged.
  - `src/components/SearchInput.tsx`: **DELETED** — it was imported only by `search/page.tsx`
    (grep-confirmed), so it was dead after the page edit. `useDebounce` stays (still used by
    `HeaderSearch`).
  - `v2-changes.md` #3 flipped to ✅ (table + section + build order).
  - `npx tsc --noEmit` + `npm run lint` both clean.
- Planned via `/architect` → plan file `~/.claude/plans/3-remove-the-gleaming-puffin.md` (approved).

## Decisions made

- **v2 #3 (decision A, agreed):** the global **header search** (`HeaderSearch`, in the app shell on
  every page) is the single search entry point and drives `/search?q=`. The `/search` page keeps its
  heading + recently-added/results body and reads `?q=` (URL is source of truth).
- **Accepted tradeoff:** the `/search` grid no longer updates per-keystroke (the deleted page input
  used a debounced `router.replace`). It now updates only when a query is **committed** from the header
  (Enter / "Show all results"). The header live dropdown (DESIGN §10.2) covers live-as-you-type; the
  full page is the "show all" destination — matches §10.2, so don't re-wire live typing into the page.
- Remaining v2 build order: **#4 only.**
- **Workflow (standing):** `v2-changes.md` is the live tracker — write each item's approach + status
  there *before* coding; flip to ✅ only after user-verifies live.

## Problems solved

- None tricky this session — the change was small and the header/page wiring was already URL-driven
  (`?q=`), so removing the page input was clean. Verified no orphaned imports (`useDebounce` still used).

## Current state

- On `main`. **Commits since last memory:** `b8964cf` (#1+#5 fixed shell) and `10d207d` (#2 anon
  sign-in prompt) were committed (so those are no longer uncommitted). **#3's changes are NOT yet
  committed** — working tree has uncommitted edits to `search/page.tsx`, the `SearchInput.tsx`
  deletion, and `v2-changes.md`. Owner controls commits.
- **Dev server is RUNNING in the background** (shell ID `b108l4a1e`, output at
  `/tmp/claude-501/.../tasks/b108l4a1e.output`). User started it manually and verified #3 live.
  → **Avoid `npm run build` while it's up** (`.next` contention) — use `tsc --noEmit` + lint.

## Next session starts with

- **v2 #4 — Stronger hover feedback (green glow)** (decision B, last v2 item). Order:
  1. **`DESIGN-spotify.md` §7 FIRST** — document a subtle green hover/active glow as a *sanctioned
     functional* cue (hover/active is a functional state, not decoration; green stays functional-only).
  2. **`globals.css`** — add a green-glow shadow token to `@theme` (e.g. `--shadow-glow`) so it's not a
     raw inline value.
  3. Apply on hover to `SongItem` (card) + nav/header action buttons; keep it subtle; confirm it reads
     as feedback, not decoration; re-tune against the now-final fixed shell.
  - Doc-first in `v2-changes.md` #4, then code, then user-verify, then flip ✅.

## Open questions / still open from post-v1

- **When to commit the uncommitted #3 work** (and whether to bundle with #4) — owner decides.
- **Post-v1 feature 20 (play bar — shuffle + "more like this") still NOT live-verified** — needs ≥2
  **same-author** demo songs seeded via the app upload flow. (Tracked in `progress-tracker.md`.)
- **`/imprint` the new components** into `ui-registry.md` (Tooltip, player shuffle/more-like-this,
  Header, `SongItem` hover-lift, `HeaderSearch` dropdown) — only `PortfolioLinks` + the `pb-24` rule
  recorded so far.
- **When all 4 v2 changes are done:** fold `v2-changes.md` into the canonical docs (new **Phase 10** in
  `build-plan.md`, status in `progress-tracker.md`, detail in `build-journal.md`), then retire it.
