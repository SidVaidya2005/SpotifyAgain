# Memory — Context reconciled + v2 UI changes in progress

Last updated: 2026-06-13

## What was built / done this session

- **Context docs fully reconciled with the codebase.** All of `context/` + root `CLAUDE.md` were
  updated to match reality: real folder tree, the `usePlayer` store snippet, the stack table
  (added Radix Tooltip + `@dnd-kit`), deploy status = **live**, **Phase 9** added to `build-plan.md`
  (post-v1 features **17–21**), Tooltip docs in `library-docs.md`, DESIGN §10 + the §10.1 rewrite,
  shared `sanitizeSearchQuery`, `PORTFOLIO_LINKS`. Retired `changes to implement.md` + `V1:changes.md`
  (folded into `context/build-journal.md`). **The context set is now trustworthy — read it first.**
- **Git is single-branch `main` now.** post-v1 commits (`V1:1–5`) + the context-reconciliation
  commit (`6676870`) were merged into `main` (merge `7cabbb0`, pushed); `post-v1-enhancements` was
  deleted local + remote. **GitHub repo confirmed PUBLIC.**
- **Started v2 UI changes — tracked in `v2-changes.md` (root, the live plan/status doc).** 4 changes,
  all decided:
  - **#1+#5 Fixed app-shell + full-width header — ✅ DONE (user-verified).** `layout.tsx`
    (header/sidebar/player all `fixed`; only `<main>` scrolls — `fixed inset-x-0 top-16 bottom-24`,
    `md:left-24 lg:left-64`), `Header.tsx` (`fixed h-16` full-width top bar), `Sidebar.tsx` (fixed,
    inset `top-16 bottom-24`, internal scroll), `DESIGN-spotify.md` §10.1 rewritten.
  - **#2 Personal nav items prompt sign-in (anon) — ✅ DONE (user-verified).** `Sidebar.tsx` +
    `BottomNav.tsx`: 4-item `navItems` with a `requiresAuth` flag; anon click on Library/Liked →
    `useAuthModal().onOpen()` (a `<button>`) instead of `<Link>`. AuthModal/store untouched.
  - **#3 Remove duplicate search bar on `/search` — ⬜ PENDING.** Decided (A): drop the page's
    `<SearchInput>`; header search drives `/search`. `SearchInput` is imported **only** by
    `search/page.tsx`, so the component can be deleted too.
  - **#4 Stronger hover feedback (green glow) — ⬜ PENDING.** Decided (B): sanctioned
    `DESIGN-spotify.md` §7 change + a green-glow `@theme` shadow token; apply to `SongItem` +
    nav/header buttons.

## Decisions made

- **Workflow:** `v2-changes.md` is a **live tracker** — write each item's approach + status there
  *before* coding it; only mark ✅ once user-verified. (Saved as a persistent preference.)
- **v2 #1+#5:** full-width fixed header above the sidebar; sidebar fixed between header & player
  (not full height); only `<main>` scrolls. §10.1 is the authority for this.
- **v2 #2:** show Library + Liked Songs to anon and prompt sign-in on click; after sign-in the user
  returns where they were (AuthModal unchanged).
- Remaining build order: **#3 then #4.**

## Current state

- On `main`, the working tree has **uncommitted changes** (owner controls commits): the v2 shell +
  #2 code (`layout.tsx`, `Header.tsx`, `Sidebar.tsx`, `BottomNav.tsx`, `DESIGN-spotify.md` §10.1),
  the "repo-public" doc edits (`progress-tracker.md`, `build-journal.md`, `build-plan.md`,
  `architecture.md`), and untracked `v2-changes.md`. Nothing committed since `7cabbb0`.
- `npm run lint` + `npx tsc --noEmit` clean. **Dev server is stopped** (was user-started this session;
  restart with `npm run dev` to verify visually). **Avoid `npm run build` while a dev server is up**
  (`.next` contention) — use lint + `tsc --noEmit`.

## Next session starts with

- **#3 search dedupe** (next in the v2 order): doc-first in `v2-changes.md`, then remove
  `<SearchInput>` from `src/app/(site)/search/page.tsx` and delete `src/components/SearchInput.tsx`;
  verify on the dev server. Then **#4 green glow** (§7 update first).

## Open questions / still open from post-v1

- **Post-v1 feature 20 (play bar — shuffle + "more like this") is built but NOT live-verified** —
  needs ≥2 **same-author** demo songs seeded via the app upload flow to exercise shuffle +
  more-like-this. (Tracked in `progress-tracker.md`.)
- **`/imprint`** the new components into `ui-registry.md` (Tooltip, player shuffle/more-like-this,
  Header, `SongItem` hover-lift, `HeaderSearch` dropdown) — only `PortfolioLinks` + the `pb-24` rule
  are recorded so far.
- When to commit the current uncommitted `main` work (owner decides).
