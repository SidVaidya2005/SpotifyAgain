# Memory — Post-v1 Enhancements (#1–#3 done; #5 built+pending-verify; #4 next)

Last updated: 2026-06-13

## What was built

v1 (16/16) was complete + live before this work. This is the **post-v1 enhancement
backlog** on branch **`post-v1-enhancements`** (off `main`; **nothing committed yet** —
owner controls commits). 4 of 5 areas built; only #4 remains.

- **`changes to implement.md`** — backlog spec (5 areas; #6 docs removed). #1/#2/#3 "✅ DONE",
  #5 "✅ BUILT — ⏳ live verify pending" (with a "Verify later" checklist), §0 table + build
  order current. #4 marked "← next".
- **`ui-registry.md`** — has `PortfolioLinks` entry + the app-shell `pb-24` clearance rule.
  **Tooltip + player NOT yet imprinted** (follow-up).
- **#1 Portfolio links (DONE):** `PORTFOLIO_LINKS` in `src/lib/constants.ts`;
  `src/components/PortfolioLinks.tsx` (NEW, `variant: 'full'|'compact'`); footer in
  `Sidebar.tsx` (+`pb-24` fix); mobile `md:hidden` footer in `layout.tsx`.
- **#2 Search default (DONE):** `src/app/(site)/search/page.tsx` — empty query renders
  "Recently added" `<SongGrid>` from `(await getSongs()).slice(0,12)`.
- **#3 Tooltips (DONE):** dep `@radix-ui/react-tooltip` (`^1.2.9`) + approved-deps;
  `src/components/Tooltip.tsx` (reusable, `Trigger asChild`, token-styled);
  `src/providers/TooltipProvider.tsx` (root, mounted in `layout.tsx`); wrapped icon-only
  controls in 8 files (Header, PlayerContent transport, LikeButton, AddToPlaylistButton,
  PlaylistHeaderActions, PlaylistList, Sidebar md-rail nav `lg:hidden`, Modal close).
- **#5 Play bar (BUILT — lint+tsc clean, NOT live-verified):**
  - `src/stores/use-player.ts` — added `isShuffled` + `originalOrder`; actions
    `toggleShuffle` + `addToQueueAfterActive`; `setIds` reshuffles new list when shuffle on
    (persistent toggle); `reset` clears new fields. Pure `shuffle` (Fisher–Yates) +
    `insertAfterActive` module helpers. No Supabase (invariant kept).
  - `src/hooks/useMoreLikeThis.ts` — NEW browser-client hook: same-author RLS-scoped read
    (excludes current), enqueue-after-active, toast success / "No other songs by X."
  - `src/components/player/PlayerContent.tsx` — Shuffle button (`FiShuffle`, leftmost
    transport, `text-accent` when on) + More-like-this (`FiRadio`, left cluster
    `hidden sm:flex`); both in `<Tooltip>`. `useOnPlay` unchanged.

## Decisions made

- **#5 shuffle = persistent global toggle (owner-chosen):** reshuffle-on-new-list lives in
  `usePlayer.setIds` (all play-launches route through it), so `useOnPlay` didn't change.
  Current track never reloads on toggle (next/prev use `findIndex(activeId)`).
- **#5 "more like this" = browser-client hook, NOT `src/server/get-songs-by-author.ts`** —
  server reads can't be imported into the client player. Enqueue-after-current (no replace,
  no auth gate; queue-only). Author match is exact `eq('author', …)`.
- **#4 (locked, NEXT):** EVOLVE `DESIGN-spotify.md` FIRST (sticky top header: left logo /
  center-left search bar / right login+actions; refreshed visual hierarchy + any new
  `@theme` tokens in `architecture.md`), THEN implement (`Header.tsx` → sticky bar +
  persistent search routing to `/search?q=`, reusing the URL-driven `SearchInput`; apply
  spacing/type/card/hover treatments; re-verify 375/768/1024/1440). Only sanctioned change
  to the design doc. Moving search into the header is an IA change — keep `/search` working.
- **#3:** Radix dep approved + broad scope; wrapped INSIDE shared button components so all
  usages inherit. **#1:** sidebar footer (md+) + mobile content footer (<md, not header).
  **#2:** reuse `getSongs()` (Home-consistent), cap 12 via `.slice()` not `.limit()`.

## Problems solved

- **App-shell clearance bug (#1):** at `≥md` sidebar footer hid BEHIND the `fixed h-24`
  player bar (aside fills full viewport height). Fix: `pb-24` on the sidebar `<aside>`
  (mirrors `<main>`'s `md:pb-24`). Durable rule in `ui-registry.md`.
- **Radix Tooltip (#3):** one root `Tooltip.Provider`; `Root→Trigger asChild→Portal→Content`;
  React context crosses portals so tooltips inside the portaled `Modal` work.
- **Portfolio URLs:** GitHub repo URL correct but repo PRIVATE → 404 for visitors; LinkedIn
  unverifiable (HTTP 999); site loads; email valid.

## Current state

- Branch **`post-v1-enhancements`**. #1/#2/#3 done + owner-verified. **#5 built, lint +
  `npx tsc --noEmit` clean, but live behaviour NOT yet checked** (owner couldn't test now).
- **Dev server running in background** (Bash task `bf22jsc01`, localhost:3000). #5 added no
  dep → hot-reloads (no restart needed). Avoid `npm run build` while dev is up (`.next`
  contention) — use lint + `tsc --noEmit` + curl.
- **Uncommitted working tree** (lots): untracked `changes to implement.md`, `ui-registry.md`,
  `memory.md`, `PortfolioLinks.tsx`, `Tooltip.tsx`, `TooltipProvider.tsx`,
  `src/hooks/useMoreLikeThis.ts`; modified `constants.ts`, `Sidebar.tsx`, `layout.tsx`,
  `search/page.tsx`, `code-standards.md`, `package.json`+lock, `Header.tsx`, `LikeButton.tsx`,
  `AddToPlaylistButton.tsx`, `PlaylistList.tsx`, `Modal.tsx`, `player/PlayerContent.tsx`,
  `playlist/PlaylistHeaderActions.tsx`, `src/stores/use-player.ts`.

## Next session starts with

**First: live-verify #5** when the app is reachable (the "Verify later" checklist in
`changes to implement.md` §5 — shuffle random-order + persist/reshuffle, more-like-this
enqueue+toast, tooltips). Seeding 2–3 same-author demo songs makes both demo-able.
**Then: #4 UI modernization** (owner runs `/architect`). Step A = update `DESIGN-spotify.md`
with the sticky-header + visual-hierarchy direction; Step B = implement Header sticky bar +
persistent search, card/spacing/hover refresh, responsive re-verify.

## Open questions

- **Live-verify #5** (pending — owner couldn't check this session).
- **Imprint** the `Tooltip` component + player into `ui-registry.md` (follow-up, not done).
- **GitHub repo still PRIVATE** — make public or the portfolio link 404s for recruiters.
- LinkedIn URL unverified (format valid) — owner eyeball.
- Run `/imprint audit` to baseline the pre-registry v1 UI? (offered, not done.)
- When/how to commit the branch (owner controls; NO co-author line per global rule).
