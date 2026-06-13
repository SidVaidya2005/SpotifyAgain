# Memory — Post-v1 Enhancements (#1 + #2 done; #3 tooltips next)

Last updated: 2026-06-13

## What was built

v1 (16/16) was already complete + live before this work. This branch is the **post-v1
enhancement backlog**. Two items shipped so far on branch **`post-v1-enhancements`**
(off `main`; nothing committed yet — owner controls commits).

- **`changes to implement.md`** — the actionable backlog spec. 5 areas (#6 docs removed).
  #1 and #2 sections retitled "✅ DONE" with what-was-built checklists; §0 table + build
  order updated; #3 marked "← next".
- **`ui-registry.md`** — created (first `/imprint`); holds the `PortfolioLinks` entry +
  the app-shell clearance rule. Rest of v1 UI not yet tracked (`/imprint audit` offered).
- **#1 Portfolio links (DONE):**
  - `src/lib/constants.ts` — `PORTFOLIO_LINKS` (github/linkedin/email/website).
  - `src/components/PortfolioLinks.tsx` — NEW plain presentational component (no hooks /
    no `'use client'` → renders in both client Sidebar + server layout). Props
    `{ variant: 'full'|'compact', className }`. External links `target=_blank
    rel="noopener noreferrer"`; email `mailto:`; `aria-label` each; `text-muted
    hover:text-text` (no accent, DESIGN §7).
  - `src/components/Sidebar.tsx` — footer block (`mt-auto`): `full` on `lg`, `compact` on
    `md` rail. **Also added `pb-24` to the aside** (bug fix, below).
  - `src/app/layout.tsx` — mobile-only (`md:hidden`) `full` footer at end of `<main>`.
- **#2 Search default (DONE):**
  - `src/app/(site)/search/page.tsx` — ONLY file. When `query === ''`, renders a
    "Recently added" heading (`text-lg font-semibold`) + existing `<SongGrid>` from
    `(await getSongs()).slice(0, 12)`. Results branch + `SearchInput`/`searchSongs`
    untouched.

## Decisions made

- **Backlog = 5 areas**, order: #1 ✅ → #2 ✅ → **#3 tooltips (next)** → #5 play bar →
  #4 UI modernization. (#6 docs removed.)
- **#3 tooltips** = NEW dep `@radix-ui/react-tooltip` — needs owner go-ahead; must be
  added to `code-standards.md` approved-deps list BEFORE install. Plan (in the spec):
  reusable `src/components/Tooltip.tsx` (token-styled: `bg-surface-2`/`shadow-dialog`/
  `text-xs`), one `Tooltip.Provider`, applied to icon-only buttons app-wide; keep
  `aria-label`s.
- **#4 UI modernization** = EVOLVE `DESIGN-spotify.md` FIRST (sticky header + centered
  search bar, visual hierarchy), then implement. Largest; sequenced last.
- **#5 play bar** = Shuffle + "More like this" (append same-author songs to queue);
  "Remix" dropped.
- **#1 placement (owner):** sidebar footer (md+) + mobile **content** footer (<md) — NOT
  the Header (keeps room for #4's search bar). Icons + "Built by Siddarth Vaidya" credit
  where there's room; icons-only on `md` rail.
- **#2 rows (owner):** reuse `getSongs()` (Home-consistent: public + signed-in viewer's
  own private), NOT a strictly-public variant. Cap 12 via `.slice()` in the page — do NOT
  add `.limit()` to `getSongs()` (Home shares it, must stay unbounded).

## Problems solved

- **App-shell clearance bug (owner-reported via screenshot):** at `≥ md` the sidebar
  portfolio links rendered BEHIND the `fixed bottom-0 h-24` player bar. The aside fills
  full viewport height (fixed player takes no flow space) so its `mt-auto` footer hit the
  viewport bottom; `<main>` already cleared the player with `md:pb-24` but the sidebar
  didn't. **Fix: `pb-24` on the sidebar `<aside>`.** Durable rule recorded in
  `ui-registry.md` (any bottom-pinned shell content must reserve `pb-24`).
- **Portfolio URLs verified:** GitHub repo URL correct but repo is **PRIVATE → 404 for
  visitors** (owner must make public); LinkedIn unverifiable (HTTP 999 bot-block, format
  valid); personal site loads; email valid.

## Current state

- Branch **`post-v1-enhancements`**. #1 + #2 complete; `npm run lint` green for both;
  #1 also passed `npm run build`; #2 headless-verified on the dev server (anon `/search`
  no-query → "Recently added" grid; `?q=<no-match>` → "No songs found", results branch OK).
- **Dev server running in background** (Bash task `bf22jsc01`, localhost:3000). NOTE: don't
  run `npm run build` while it's up (`.next` contention) — use lint + curl against :3000,
  or stop the dev task first.
- **Uncommitted working tree:** untracked `changes to implement.md`, `ui-registry.md`,
  `memory.md`; modified `src/lib/constants.ts`, `src/components/PortfolioLinks.tsx` (new),
  `src/components/Sidebar.tsx`, `src/app/layout.tsx`, `src/app/(site)/search/page.tsx`.

## Next session starts with

**#3 Tooltips.** First get owner go-ahead to add `@radix-ui/react-tooltip`; add it to the
`code-standards.md` approved-deps list, `npm install`, then build a reusable
`src/components/Tooltip.tsx` + one `Tooltip.Provider`, and apply to icon-only buttons
(Header upload/create-playlist, player prev/play/next/mute, `LikeButton`,
`AddToPlaylistButton`, sidebar `md` rail nav, `PlaylistHeaderActions`). Owner suggested
running `/architect` per feature first. Run `/imprint` after building the Tooltip component.

## Open questions

- **GitHub repo still PRIVATE** — make public or the portfolio link is dead for recruiters.
- LinkedIn URL unverified (format valid) — owner eyeball.
- Approve `@radix-ui/react-tooltip` dep for #3?
- Run `/imprint audit` to baseline the pre-registry v1 UI? (offered, not done.)
- When/how to commit the branch (owner controls; NO co-author line per global rule).
