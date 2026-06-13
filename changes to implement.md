# SpotifyAgain — Enhancement Backlog (post-v1)

> The original `build-plan.md` is **16/16 complete and live** at
> https://spotifyagain.onrender.com. Nothing from that plan is unbuilt. The items
> below are **net-new scope** layered on top of the shipped app to raise it to
> portfolio-quality. Decisions in §0 were locked with the owner on **2026-06-13**.

## Ground rules (unchanged)

- All `architecture.md` **invariants still apply** — Supabase clients only in
  `src/lib/supabase/`, all DB writes via `src/actions/*` Server Actions (re-check
  `getUser()`), Zustand holds ephemeral UI/player state only, RLS unchanged.
- `DESIGN-spotify.md` remains the **visual source of truth**. Area #4 is the *only*
  sanctioned change to it (see §4) — everything else styles with existing `@theme`
  tokens.
- **New dependencies need approval** and must be added to `code-standards.md` →
  Dependencies *before* install (this affects #3 tooltips).

---

## 0. Resolved decisions

| # | Area | Decision |
| - | ---- | -------- |
| 1 | Portfolio links placement | **Sidebar footer (desktop) + mobile content footer** (sidebar is hidden < `md`) — ✅ **built 2026-06-13** |
| 2 | Search default content | **Recently-added songs** via `getSongs()` (real data, no schema change) — ✅ **built 2026-06-13** |
| 3 | Tooltips | **`@radix-ui/react-tooltip`**, broad scope (all icon-only controls) — ✅ **built 2026-06-13** |
| 4 | UI modernization scope | **Evolve the design system first** (added `DESIGN-spotify.md` §10), then implement — ✅ **built + owner-verified 2026-06-13** |
| 5 | "Remix" button | **Replace with "More like this" by author** + Shuffle — ✅ **built 2026-06-13** (⏳ live verify pending) |

## Portfolio URLs (provided — verified 2026-06-13)

| Link | URL | Status |
| ---- | --- | ------ |
| Email | `mailto:siddarthvaidya2005@gmail.com` | ✓ valid format |
| GitHub repo | `https://github.com/SidVaidya2005/SpotifyAgain` | ⚠️ URL correct (matches git remote) but the repo is **PRIVATE** — a logged-out visitor gets a 404. **Make it public** before linking it, or the portfolio link is dead. |
| LinkedIn | `https://www.linkedin.com/in/siddarth-vaidya-885871239` | ⓘ can't auto-verify (LinkedIn blocks bots, HTTP 999); format valid — confirm manually |
| Personal site | `https://siddarthvaidya2005-7iyf.onrender.com` | ✓ loads — Siddarth Vaidya's portfolio (Data Science & AI / Full-Stack) |

---

## 1. Portfolio links integration ✅ DONE (2026-06-13)

**Built on branch `post-v1-enhancements`** (not yet committed). Verified: `npm run lint`
+ `npm run build` green; anonymous SSR renders all four links + the "Built by Siddarth
Vaidya" credit with `rel="noopener noreferrer"`. Owner visually confirmed.

**Decision:** sidebar footer on desktop + a mobile-reachable spot. Rationale: the
primary audience is logged-out recruiters, so the links must be visible *without*
signing in — that rules out the `UserMenu` dropdown (hidden for anon).

**What was built**
- [x] `src/lib/constants.ts` — `PORTFOLIO_LINKS` (github / linkedin / email / website),
      centralized, not inline.
- [x] `src/components/PortfolioLinks.tsx` — plain presentational component (no hooks / no
      `'use client'`, so it renders in both the client `Sidebar` and the server
      `layout.tsx`). Props `{ variant: 'full' | 'compact', className }`. Icons via
      `react-icons/fi`; external links `target="_blank" rel="noopener noreferrer"`, email
      `mailto:`, `aria-label` per link; `text-muted hover:text-text` (no accent, DESIGN §7).
- [x] `src/components/Sidebar.tsx` — footer pinned to the bottom (`mt-auto`): `full`
      (credit + icons) on `lg`, `compact` (icons-only, centered) on the `md` rail.
- [x] **Mobile spot = footer at the END of page content** (`md:hidden`, inside
      `layout.tsx`'s `<main>`) — **not the Header**, which keeps room for #4's search bar
      and is redesign-proof. (Changed from the original "mobile Header" plan.)
- [x] Tooltips — added in #3 (`aria-label`s kept for a11y).

**Bug fixed during build:** at `≥ md` the sidebar footer rendered *behind* the
`fixed h-24` player bar — the aside had no bottom clearance (the `<main>` already used
`md:pb-24`). Fix: added `pb-24` to the sidebar `<aside>`. Recorded as a durable app-shell
clearance rule in `ui-registry.md`.

**Reminder:** the GitHub repo is still **private** → that link 404s for visitors until
it's made public (see the Portfolio URLs table above).

---

## 2. Improve search-page UX ✅ DONE (2026-06-13)

**Built on branch `post-v1-enhancements`** (not yet committed). Verified: `npm run lint`
green; against the running dev server, anon `/search` (no query) → 200 with the "Recently
added" grid (old prompt gone), and `/search?q=<no-match>` → 200 still shows "No songs
found for…" (results branch intact).

**Decision:** default the empty-query state to **recently-added songs** via the existing
`getSongs()` read (owner-chosen: Home-consistent over a strictly-public variant).
"Trending/popular/recommended" were rejected — no play-count/analytics data and
recommendations are out of scope. Real data, no schema change, no new fetcher.

**What was built** (single file — `src/app/(site)/search/page.tsx`)
- [x] When `query === ''`, fetch `(await getSongs()).slice(0, 12)` — the 12 newest songs
      (RLS-scoped: public to all, plus the signed-in viewer's own). **Did not** add
      `.limit()` to `getSongs()` itself (Home shares it and must stay unbounded).
- [x] Render a "Recently added" heading (`text-lg font-semibold`) + the existing
      `<SongGrid>` instead of the bare prompt; thin/empty catalog shows "No songs in the
      catalog yet." Plays/likes/add-to-playlist come free from `SongItem`; playing sets
      the queue to the recent list (`SongGrid`'s `useOnPlay`).
- [x] After a query: unchanged (results grid / "No songs found"). `SearchInput`,
      `searchSongs`, and the URL-driven flow untouched.

**Tradeoffs / notes**
- `getSongs()` shows a signed-in viewer their own private songs too (the documented Home
  deviation, 08) — accepted, consistent with Home; anon sees public-only via RLS.
- "Recently searched" (localStorage chips) was considered but adds client state for little
  portfolio payoff; can layer on later.

---

## 3. Tooltips for discoverability ✅ DONE (2026-06-13)

**Built on branch `post-v1-enhancements`** (not yet committed). Verified:
`@radix-ui/react-tooltip` in `package.json` (`^1.2.9`); `npm run lint` + `npx tsc --noEmit`
clean; owner visually confirmed tooltips on hover/focus.

**Decision:** one reusable Radix tooltip applied **broadly** to icon-only controls
(owner-approved dep + broad scope). `aria-label`s kept everywhere (touch/AT fallback).

**What was built**
- [x] Added `@radix-ui/react-tooltip` to `code-standards.md` approved-deps, then installed.
- [x] `src/components/Tooltip.tsx` — reusable `<Tooltip content="…">{trigger}</Tooltip>`
      (Radix `Trigger asChild`), token-styled (`bg-surface-2` / `text-xs` / `text-text` /
      `shadow-dialog`); optional `side` + `className`.
- [x] `src/providers/TooltipProvider.tsx` — single root `Tooltip.Provider`
      (`delayDuration={300}`), mounted in `layout.tsx` around the shell + player.
- [x] Applied across 8 files: Header (upload / create-playlist), player transport
      (prev / play↔pause / next / mute↔unmute, dynamic labels), `LikeButton`,
      `AddToPlaylistButton`, `PlaylistHeaderActions` (add songs / rename / delete),
      `PlaylistList` create `+`, the `md` sidebar-rail nav (`lg:hidden`, `side="right"` —
      rail-only), and the `Modal` close `X`.
- [x] Skipped `BottomNav` (touch-only) and `UserMenu` (menu trigger); all `aria-label`s kept.

**Tradeoffs / notes**
- Tooltips are hover/focus affordances — touch relies on the retained `aria-label`s.
- A pure CSS/`title` approach avoids the dep but can't match the design tokens or hover
  delay; Radix is the cleaner, consistent choice given the stack.
- Follow-up: record the `Tooltip` pattern in `ui-registry.md` via `/imprint`.

---

## 4. Modernize the overall UI ✅ DONE (2026-06-13, owner-verified)

**Built on branch `post-v1-enhancements`** (not yet committed). `npm run lint` +
`npx tsc --noEmit` clean; headless: `/` + `/search` 200 with the new header search +
top gradient, `/library` still gates. **Owner visually confirmed ("everything looks fine").**

**Decision:** **evolved the design system first** — added **§10 "Modernization v2"** to
`DESIGN-spotify.md` (sticky header, search dropdown, card hover-lift, section rhythm, top
gradient; all existing tokens, no new colors), then implemented to match. Direction =
**"add depth & separation."**

**Step A — `DESIGN-spotify.md`**
- [x] Added §10: sticky header spec, live-search dropdown, card hover-lift, section rhythm,
      subtle `surface→base` top gradient, guardrails (green functional-only, no gray borders).

**Step B — implemented** (owner-chosen specifics, some changed from the first sketch)
- [x] **Header layout:** logo moved **into the header** (left, all sizes); **nav stays in the
      sidebar** (sidebar wordmark removed). Header = logo · search · actions; restyled sticky
      (`bg-base/80` + `backdrop-blur` + soft seam). `Header.tsx`, `Sidebar.tsx`.
- [x] **Header search = inline live dropdown** (owner-chosen, **not** route-only): new
      `src/components/HeaderSearch.tsx` + `src/hooks/useSearchSongs.ts` (browser-client,
      RLS-scoped, limit 6) + shared `src/lib/search.ts` `sanitizeSearchQuery` (also reused by
      `src/server/search-songs.ts`). Click a result → plays (queue = results); Enter / "Show
      all results" → `/search?q=`; closes on outside-click/Escape. `useDebounce` reused.
- [x] **Card depth:** `SongItem` hover-lift (`-translate-y-1` + `shadow-card` + `bg-card-2`).
- [x] **Top gradient:** `top-fade` `@utility` in `globals.css`; mounted behind the top of
      `<main>` (`layout.tsx`).
- [x] Re-verify responsive 375/768/1024/1440 — owner confirmed; layout contract holds.

**Tradeoffs / notes**
- Header search is a global live dropdown; `/search` keeps its own `SearchInput` + "Recently
  added" default (mild redundancy on `/search`, accepted; shareable URLs preserved).
- Mobile signed-in density (logo + search + create + upload + avatar at 375px) is tight by
  design — owner confirmed acceptable; the search bar shrinks but stays usable.
- Follow-up: `/imprint` the new header / card-lift / search-dropdown patterns.

---

## 5. Enhance the play bar ✅ BUILT (2026-06-13) — ⏳ live verification pending

**Built on branch `post-v1-enhancements`** (not yet committed). `npm run lint` +
`npx tsc --noEmit` clean. **Live behaviour not yet checked** — owner to verify later (see
"Verify later" below). No new dependency.

**Decision:** add **Shuffle** (a **persistent global toggle** — owner-chosen) and replace
the undefined **"Remix"** with **"More like this"** (queue other songs by the current
track's author). Algorithmic radio/recs stay out of scope; author-based queueing uses real data.

**What was built**
- [x] `src/stores/use-player.ts` — added `isShuffled` + `originalOrder` and actions
      `toggleShuffle` / `addToQueueAfterActive`; `setIds` reshuffles a newly-launched list
      when shuffle is on (persistent toggle); `reset` clears the new fields. Pure
      module-scope `shuffle` (Fisher–Yates) + `insertAfterActive` helpers; no Supabase.
- [x] `src/hooks/useMoreLikeThis.ts` — NEW browser-client hook: RLS-scoped read of
      same-author songs (excludes current), enqueues them after the current track via
      `addToQueueAfterActive`, toasts success / "No other songs by X." (Used a browser-client
      hook — **not** `src/server/get-songs-by-author.ts` — since server reads can't be
      imported into the client player.)
- [x] `src/components/player/PlayerContent.tsx` — **Shuffle** button (`FiShuffle`, leftmost
      in transport, `text-accent` when on, `aria-pressed`) + **More like this** button
      (`FiRadio`, left cluster, `hidden sm:flex`); both wrapped in the #3 `Tooltip`.
      `useOnPlay` unchanged (reshuffle lives in `setIds`).

**Verify later** (live/interactive — not curl-able):
- [ ] Shuffle (need ≥2 queued songs): toggle on → icon turns accent green, current track
      keeps playing, next traverses a random order; toggle off → next follows original order.
- [ ] With shuffle on, play a different list → it reshuffles and shuffle stays on.
- [ ] "More like this" → same-author songs enqueue after the current track + toast; thin
      catalog → "No other songs by X."; works signed out.
- [ ] Tooltips show on both new buttons.

**Tradeoffs / notes**
- "More like this" by author is intentionally simple/honest — no fake ML. Catalog is thin
  (~1–2 public songs) so it may find nothing and shuffle needs ≥2 songs to observe — seeding
  a few same-author demo songs makes both demo properly.
- Follow-up: `/imprint` the player (record the shuffle-active accent usage).

---

## Suggested build order

1. ~~**#1 Portfolio links**~~ — ✅ **done (2026-06-13)**.
2. ~~**#2 Search default**~~ — ✅ **done (2026-06-13)**.
3. ~~**#3 Tooltips**~~ — ✅ **done (2026-06-13)**.
4. ~~**#5 Play bar**~~ — ✅ **built (2026-06-13)** · ⏳ live verify pending.
5. ~~**#4 UI modernization**~~ — ✅ **done + owner-verified (2026-06-13)**.

> **All 5 enhancement areas are built.** #1–#4 owner-verified; **#5 awaits a live check**
> (see §5 "Verify later"). Each was built one-at-a-time per `code-standards`. None committed
> yet — the owner controls doc/feature commits.
>
> **Open follow-ups:** live-verify #5 · `/imprint` the new components · make the GitHub repo
> **public** (the portfolio link 404s until then) · update `progress-tracker.md` · commit the branch.
