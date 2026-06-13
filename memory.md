# Memory — Post-v1 Enhancements (Feature #1 Portfolio Links done)

Last updated: 2026-06-13

## What was built

The v1 build plan (16/16) was already complete + live before this session. This session
**started the post-v1 enhancement backlog** on a new branch and shipped the first item.

- **New branch `post-v1-enhancements`** (off `main`). `main` stays clean + deployable
  (live at https://spotifyagain.onrender.com).
- **`changes to implement.md`** — turned the owner's rough proposal into an actionable
  spec. 6 areas → **5** (the "Documentation update" section was removed per owner).
  Records resolved decisions, per-area plan/files/tradeoffs, verified portfolio URLs,
  and a suggested build order.
- **`ui-registry.md`** — CREATED (first `/imprint`). Holds the `PortfolioLinks` entry +
  the app-shell clearance rule (see Problems solved). The rest of the v1 UI is NOT yet
  tracked — offered `/imprint audit` to baseline it (not run).
- **Feature #1 — Portfolio links (DONE, lint+build green, headless-verified):**
  - `src/lib/constants.ts` — added `PORTFOLIO_LINKS` (github/linkedin/email/website).
  - `src/components/PortfolioLinks.tsx` — NEW plain presentational component (no hooks /
    no `'use client'` so it renders in both client Sidebar + server layout). Props
    `{ variant: 'full'|'compact', className }`. `full` = "Built by Siddarth Vaidya"
    credit + icon row; `compact` = icons only, centered. External links get
    `target=_blank rel="noopener noreferrer"`; email is `mailto:`; each has `aria-label`.
  - `src/components/Sidebar.tsx` — footer block (`mt-auto px-4 py-6 lg:px-6`): `full` on
    `lg`, `compact` on the `md` rail. Also added **`pb-24`** to the aside (bug fix).
  - `src/app/layout.tsx` — mobile-only (`md:hidden`) `full` footer at the end of `<main>`.

## Decisions made

- **Enhancement backlog = 5 areas**, build order: **#1 portfolio links (DONE)** → #2
  search default → #3 tooltips → #5 play bar → #4 UI modernization. (#6 docs removed.)
- **#2 search default = recently-added public songs** via existing `getSongs()` (real
  data; "trending/recommended" rejected — no analytics, recs are out of scope).
- **#3 tooltips = `@radix-ui/react-tooltip`** — a NEW dep; must be added to
  `code-standards.md` approved-deps list BEFORE install.
- **#4 UI modernization = EVOLVE the design system first** — update `DESIGN-spotify.md`
  (sticky top header w/ centered search bar, visual hierarchy), THEN implement to match.
  This is the only sanctioned change to the design doc. Largest area; sequenced last.
- **#5 play bar = Shuffle + "More like this" (by author)** — "Remix" was undefined, so
  it's replaced with appending same-author songs to the queue (real data, on-scope).
- **#1 placement/framing (owner-chosen):** sidebar footer (md+) + mobile content footer
  (<md, NOT the header — keeps room for #4's search bar); icons + credit where there's
  room, icons-only on the `md` rail; **no accent green** on links (DESIGN §7 functional-only).
- **Owner controls all commits** — nothing committed this session (carried from prior memory).

## Problems solved

- **App-shell clearance bug (owner-reported via screenshot):** at `≥ md` the sidebar
  portfolio links rendered BEHIND the `fixed bottom-0 h-24` player bar. Cause: the
  sidebar `<aside>` fills full viewport height (the fixed player takes no flow space) so
  its `mt-auto` footer landed at the viewport bottom. `<main>` already clears the player
  with `md:pb-24`; the sidebar didn't. **Fix: added `pb-24` to the aside.** Recorded as a
  durable rule in `ui-registry.md` (any bottom-pinned shell content must reserve `pb-24`).
- **Portfolio URL verification:** GitHub repo URL is correct (matches git remote) but the
  repo is **PRIVATE → 404 for logged-out visitors**; LinkedIn can't be auto-verified
  (HTTP 999 bot-block, format valid); personal site loads; email format valid.

## Current state

- On branch **`post-v1-enhancements`**. #1 complete: `npm run lint` + `npm run build`
  green; headless prod check confirmed anon SSR renders all 4 links + the credit +
  `rel=noopener`. Owner visually confirmed links work; the `pb-24` fix was hot-reloaded —
  **owner was about to re-check the desktop/`md` view**.
- **Dev server running in background** (Bash task id `bf22jsc01`) on localhost:3000,
  logging to /tmp/...bf22jsc01.output.
- **Uncommitted working tree** on the branch: untracked `changes to implement.md`,
  `ui-registry.md`, `memory.md`; modified `src/lib/constants.ts`,
  `src/components/PortfolioLinks.tsx` (new), `src/components/Sidebar.tsx`,
  `src/app/layout.tsx`.

## Next session starts with

1. Confirm the sidebar **`pb-24`** fix looks right at `≥ md` (links sit above the player
   bar, full sidebar on `lg`, icon-only on the `md` rail), and the mobile footer at `< md`.
2. Then build **#2 search default**: in `src/app/(site)/search/page.tsx`, when
   `query === ''`, render a "Recently added" `<SongGrid>` from `getSongs()` (slice ~12);
   keep the existing results / "No songs found" behavior after a query. Quick, no schema.

## Open questions

- **GitHub repo is still PRIVATE** — owner must make it public or the portfolio link is
  dead for recruiters.
- LinkedIn URL unverified (format valid) — owner should eyeball.
- Run **`/imprint audit`** to baseline the pre-registry v1 UI? (offered, not done.)
- When/how to commit the branch work (owner controls commits). No co-author line in
  commits (global rule).
