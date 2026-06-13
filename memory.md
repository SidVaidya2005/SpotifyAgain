# Memory — Post-v1 Enhancements (#1–#3 done; #5 play bar next)

Last updated: 2026-06-13

## What was built

v1 (16/16) was complete + live before this work. This is the **post-v1 enhancement
backlog** on branch **`post-v1-enhancements`** (off `main`; nothing committed yet — owner
controls commits). 3 of 5 areas shipped: #1, #2, #3. Remaining: #5 (next), #4 (last).

- **`changes to implement.md`** — backlog spec, 5 areas (#6 docs removed). #1/#2/#3
  retitled "✅ DONE" with what-was-built checklists; §0 table + build order current.
- **`ui-registry.md`** — created (first `/imprint`); has the `PortfolioLinks` entry + the
  app-shell clearance rule. **Tooltip NOT yet imprinted** (follow-up).
- **#1 Portfolio links (DONE):** `src/lib/constants.ts` `PORTFOLIO_LINKS`;
  `src/components/PortfolioLinks.tsx` (NEW, plain component, `variant: 'full'|'compact'`);
  footer in `Sidebar.tsx` (+`pb-24` bug fix); mobile `md:hidden` footer in `layout.tsx`.
- **#2 Search default (DONE):** `src/app/(site)/search/page.tsx` only — empty query renders
  a "Recently added" `<SongGrid>` from `(await getSongs()).slice(0,12)`; results branch
  untouched.
- **#3 Tooltips (DONE):**
  - Added `@radix-ui/react-tooltip` (`^1.2.9`) + to `code-standards.md` approved-deps.
  - `src/components/Tooltip.tsx` — reusable `<Tooltip content="…">{trigger}</Tooltip>`
    (Radix `Trigger asChild`), token-styled (`bg-surface-2`/`text-xs`/`text-text`/
    `shadow-dialog`), optional `side` + `className`.
  - `src/providers/TooltipProvider.tsx` — single root `Tooltip.Provider` (`delayDuration=300`),
    mounted in `layout.tsx` wrapping the shell + player + modals.
  - Wrapped icon-only controls in 8 files: `Header` (upload, create-playlist),
    `player/PlayerContent` (prev/play↔pause/next/mute↔unmute, dynamic labels), `LikeButton`,
    `AddToPlaylistButton`, `playlist/PlaylistHeaderActions` (add-songs/rename/delete),
    `PlaylistList` (+), `Sidebar` nav (`lg:hidden` + `side="right"`, rail-only), `Modal` (close X).
    Skipped `BottomNav` (touch) + `UserMenu`. All `aria-label`s kept.

## Decisions made

- **Backlog order:** #1✅ → #2✅ → #3✅ → **#5 play bar (next)** → #4 UI modernization (last).
- **#5 (locked):** Shuffle + "More like this" (append same-author songs to queue); "Remix"
  dropped. Shuffle = extend `src/stores/use-player.ts` with `isShuffled` + keep original
  order to restore; button in `PlayerContent` controls cluster; active = accent green
  (functional, DESIGN §7 OK). "More like this" = new `src/server/get-songs-by-author.ts`
  (RLS-scoped, exclude current track) → append via `setIds`, toast if none. Both reuse the
  #3 `Tooltip`. Catalog is thin (~1 public song) so it may find nothing — empty toast handles it.
- **#4 (locked):** EVOLVE `DESIGN-spotify.md` FIRST (sticky header + centered search bar +
  visual hierarchy), then implement. Only sanctioned change to the design doc. Largest; last.
- **#3 tooltips:** Radix dep (owner-approved) + broad scope (all icon-only). Wrapped INSIDE
  shared button components (LikeButton/AddToPlaylistButton) so all usages inherit.
- **#1:** sidebar footer (md+) + mobile **content** footer (<md, NOT header). **#2:** reuse
  `getSongs()` (Home-consistent, public + own private); cap 12 via `.slice()`, NOT `.limit()`
  on getSongs (Home shares it).

## Problems solved

- **App-shell clearance bug (#1):** at `≥md` the sidebar footer hid BEHIND the
  `fixed bottom-0 h-24` player bar (aside fills full viewport height; fixed player takes no
  flow space). **Fix: `pb-24` on the sidebar `<aside>`** (mirrors `<main>`'s `md:pb-24`).
  Durable rule in `ui-registry.md`.
- **Radix Tooltip API** confirmed via Context7 (`/radix-ui/website`): one `Tooltip.Provider`
  at root, then `Root → Trigger asChild → Portal → Content`. React context crosses portals,
  so tooltips inside the portaled `Modal` still see the root Provider.
- **Portfolio URLs verified:** GitHub repo URL correct but repo is **PRIVATE → 404 for
  visitors**; LinkedIn unverifiable (HTTP 999 bot-block); site loads; email valid.

## Current state

- Branch **`post-v1-enhancements`**. #1/#2/#3 done. Static verification green throughout:
  `npm run lint` clean; #3 also `npx tsc --noEmit` clean; #1 passed `npm run build`. Owner
  visually confirmed all three (tooltips, search default, links).
- **Dev server running in background** (Bash task `bf22jsc01`, localhost:3000). It started
  BEFORE the tooltip dep install — if a tooltip throws "module not found", restart it. Do NOT
  run `npm run build` while it's up (`.next` contention) — use lint + `tsc --noEmit` + curl.
- **Uncommitted working tree:** untracked `changes to implement.md`, `ui-registry.md`,
  `memory.md`, `src/components/PortfolioLinks.tsx`, `src/components/Tooltip.tsx`,
  `src/providers/TooltipProvider.tsx`; modified `src/lib/constants.ts`,
  `src/components/Sidebar.tsx`, `src/app/layout.tsx`, `src/app/(site)/search/page.tsx`,
  `context/code-standards.md`, `package.json` + lockfile, `Header.tsx`, `LikeButton.tsx`,
  `AddToPlaylistButton.tsx`, `PlaylistList.tsx`, `Modal.tsx`, `player/PlayerContent.tsx`,
  `playlist/PlaylistHeaderActions.tsx`.

## Next session starts with

**#5 Enhance the play bar** (owner runs `/architect` per feature first). Shuffle: add
`isShuffled` (+ preserve original order) to `src/stores/use-player.ts`; shuffle button in
`PlayerContent` controls cluster; next/prev walk shuffled order; toggle restores launched-from
order; active = accent green. "More like this": new `src/server/get-songs-by-author.ts`
(RLS-scoped, exclude current track) → append to queue via `setIds`, toast if none. Wrap both
new buttons in the existing `<Tooltip>`. Run `/imprint` after.

## Open questions

- **Imprint the `Tooltip` component** into `ui-registry.md` (follow-up, not yet done).
- **GitHub repo still PRIVATE** — make public or the portfolio link is dead for recruiters.
- LinkedIn URL unverified (format valid) — owner eyeball.
- Run `/imprint audit` to baseline the pre-registry v1 UI? (offered, not done.)
- When/how to commit the branch (owner controls; NO co-author line per global rule).
