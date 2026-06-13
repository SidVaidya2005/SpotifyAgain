# Memory — Post-v1 Enhancements (ALL 5 built; #1–#4 verified, #5 live-verify pending)

Last updated: 2026-06-13

## What was built

v1 (16/16) was complete + live before this. This is the **post-v1 enhancement backlog** on
branch **`post-v1-enhancements`** (off `main`; **nothing committed yet** — owner controls
commits). **All 5 areas now built.** #1–#4 owner-verified; **#5 still needs a live check.**

- **#1 Portfolio links (DONE, verified):** `PORTFOLIO_LINKS` in `src/lib/constants.ts`;
  `src/components/PortfolioLinks.tsx` (NEW, `variant: 'full'|'compact'`); sidebar footer
  (+`pb-24` clearance fix) + mobile `md:hidden` footer in `layout.tsx`.
- **#2 Search default (DONE, verified):** `src/app/(site)/search/page.tsx` — empty query →
  "Recently added" `<SongGrid>` from `(await getSongs()).slice(0,12)`.
- **#3 Tooltips (DONE, verified):** dep `@radix-ui/react-tooltip` (`^1.2.9`) + approved-deps;
  `src/components/Tooltip.tsx` (reusable, `Trigger asChild`); `src/providers/TooltipProvider.tsx`
  (root, in `layout.tsx`); wrapped icon-only controls in 8 files.
- **#5 Play bar (BUILT — lint+tsc clean; NOT live-verified):**
  `src/stores/use-player.ts` (+`isShuffled`/`originalOrder`, `toggleShuffle`,
  `addToQueueAfterActive`; `setIds` reshuffles when shuffle on; pure `shuffle`/`insertAfterActive`);
  `src/hooks/useMoreLikeThis.ts` (NEW, browser-client same-author enqueue + toast);
  `src/components/player/PlayerContent.tsx` (Shuffle `FiShuffle` leftmost transport, accent when
  on; More-like-this `FiRadio` left cluster `hidden sm:flex`; both in `<Tooltip>`).
- **#4 UI modernization (DONE, owner-verified — "everything looks fine"):**
  - **Step A:** added **§10 "Modernization v2"** to `context/DESIGN-spotify.md` (sticky header,
    search dropdown, card hover-lift, section rhythm, top gradient; all existing tokens).
  - `src/lib/search.ts` (NEW) — `sanitizeSearchQuery`, reused by `src/server/search-songs.ts`.
  - `src/hooks/useSearchSongs.ts` (NEW) — browser-client live search (RLS-scoped, limit 6).
  - `src/components/HeaderSearch.tsx` (NEW) — pill input + live dropdown (click result → play
    via `useOnPlay`; Enter / "Show all" → `/search?q=`; outside-click/Escape closes; `useDebounce`).
  - `src/components/Header.tsx` — restyled sticky (`bg-base/80` + `backdrop-blur` + seam),
    **logo moved into header (left, all sizes)**, mounts `HeaderSearch`.
  - `src/components/Sidebar.tsx` — **wordmark removed** (nav kept, +`pt-6`).
  - `src/components/SongItem.tsx` — card hover-lift (`-translate-y-1` + `shadow-card` + `bg-card-2`).
  - `src/app/globals.css` — `@utility top-fade`; `src/app/layout.tsx` — gradient `<div>` (`-z-10`)
    behind top of `<main>` (main now `relative`).
- **`changes to implement.md`** — all 5 sections marked (#1–#4 ✅ done, #5 ✅ built/⏳ verify),
  §0 table + build order current, closing "open follow-ups" note.
- **`ui-registry.md`** — has `PortfolioLinks` + the `pb-24` clearance rule only. **Tooltip,
  player (#5), and #4 header/card/dropdown NOT yet imprinted** (follow-up).

## Decisions made

- **#4 direction = "add depth & separation"** (owner): elevated card hover-lift, top gradient,
  section rhythm, styled sticky header. Dark + functional-green only; **§10 of DESIGN-spotify.md
  is now the authority** for these (the only sanctioned design-doc change).
- **#4 header (owner note):** nav links **stay in the sidebar**; **only the logo moves to the
  header**. Header already structurally pinned (sits above `<main>`'s scroll) → "sticky" was
  visual styling, not a layout rewrite.
- **#4 search = inline live dropdown** (owner, not route-only). Client uses browser-client
  `useSearchSongs` (server reads can't import into client); shared `sanitizeSearchQuery` keeps
  one source of truth; `/search` page kept for shareable URLs + #2 default.
- **#5 shuffle = persistent global toggle** (reshuffle-on-new-list in `setIds`); "more like this"
  = enqueue-after-current same-author (browser-client hook), no auth gate.
- Earlier: #1 sidebar+mobile-content footer; #2 reuse `getSongs()`; #3 Radix dep + broad scope.

## Problems solved

- **`pb-24` clearance bug (#1):** sidebar footer hid behind the `fixed h-24` player bar — added
  `pb-24` to the aside (rule in `ui-registry.md`).
- **#4 gradient stacking:** an `absolute` top-of-content gradient renders ABOVE static siblings;
  fixed by `-z-10` (with `main` `relative`) so content sits on top.
- **Tailwind v4 gradient ambiguity:** used a token-based `@utility top-fade` (linear-gradient
  `var(--color-surface)`→transparent) instead of `bg-gradient`/`bg-linear` class naming.
- **Portfolio URLs:** GitHub repo PRIVATE → 404 for visitors; LinkedIn unverifiable (HTTP 999).

## Current state

- Branch **`post-v1-enhancements`**, all 5 built. `npm run lint` + `npx tsc --noEmit` clean
  throughout; headless smoke checks green (`/`, `/search` 200 w/ new header+gradient; `/library`
  307-gates). #1–#4 owner-verified live; **#5 NOT yet live-verified**.
- **Dev server running** (Bash task **`bbby0fach`**, localhost:3000 — the user restarted it;
  prior `bf22jsc01` is stale). No new dep since #3, so hot-reload works. Avoid `npm run build`
  while dev is up (`.next` contention) — use lint + `tsc --noEmit` + curl.
- **Large uncommitted working tree** on the branch (untracked: `changes to implement.md`,
  `ui-registry.md`, `memory.md`, `PortfolioLinks.tsx`, `Tooltip.tsx`, `TooltipProvider.tsx`,
  `useMoreLikeThis.ts`, `HeaderSearch.tsx`, `useSearchSongs.ts`, `lib/search.ts`; modified
  `constants.ts`, `Sidebar.tsx`, `layout.tsx`, `search/page.tsx`, `code-standards.md`,
  `DESIGN-spotify.md`, `globals.css`, `package.json`+lock, `Header.tsx`, `LikeButton.tsx`,
  `AddToPlaylistButton.tsx`, `PlaylistList.tsx`, `Modal.tsx`, `PlayerContent.tsx`,
  `PlaylistHeaderActions.tsx`, `SongItem.tsx`, `server/search-songs.ts`, `stores/use-player.ts`).

## Next session starts with

The build work is essentially **done**. Remaining, in priority order:
1. **Live-verify #5** (shuffle: toggle→accent, random next, persist/reshuffle, off restores;
   more-like-this: enqueue-after + toast / "No other songs by X."; tooltips). Seed 2–3 same-author
   demo songs to demo it. Then flip #5 to fully verified in `changes to implement.md`.
2. **`/imprint`** the new components (Tooltip, player shuffle/more-like-this, Header, SongItem
   hover-lift, HeaderSearch dropdown) into `ui-registry.md`.
3. **Update `progress-tracker.md`** to note the post-v1 enhancements.
4. **Commit the branch** (owner decision; NO co-author line per global rule) and consider a PR
   into `main` (which redeploys Render).

## Open questions

- **Live-verify #5** (only unverified feature).
- **GitHub repo still PRIVATE** — make public or the #1 portfolio link 404s for recruiters.
- LinkedIn URL unverified (format valid) — owner eyeball.
- Commit strategy / when to merge to `main` (owner controls).
- `/imprint audit` to baseline the pre-registry v1 UI? (offered, not done.)
