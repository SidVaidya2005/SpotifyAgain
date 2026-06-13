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
| 2 | Search default content | **Recently-added public songs** (real data, no schema change) |
| 4 | UI modernization scope | **Evolve the design system first** — update `DESIGN-spotify.md`, then implement to match |
| 5 | "Remix" button | **Replace with "More like this" by author**; ship Shuffle alongside |

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
- [ ] Tooltips — deferred to #3 (`aria-label`s added now regardless).

**Bug fixed during build:** at `≥ md` the sidebar footer rendered *behind* the
`fixed h-24` player bar — the aside had no bottom clearance (the `<main>` already used
`md:pb-24`). Fix: added `pb-24` to the sidebar `<aside>`. Recorded as a durable app-shell
clearance rule in `ui-registry.md`.

**Reminder:** the GitHub repo is still **private** → that link 404s for visitors until
it's made public (see the Portfolio URLs table above).

---

## 2. Improve search-page UX

**Decision:** default the empty-query state to **recently-added public songs**.
"Trending/popular/recommended" are not backed by real data — there's no play-count or
analytics column and recommendations are explicitly out of scope (`project-overview.md`).
Recently-added is honest, real, and needs no schema change.

**Plan**
- [ ] In `src/app/(site)/search/page.tsx`, when `query === ''`, fetch recent songs via
      the existing `getSongs()` read (already `order('created_at', desc)`; RLS returns
      public + the viewer's own). Slice to ~12.
- [ ] Render a "Recently added" heading + `<SongGrid>` instead of the bare prompt.
      Plays/likes/add-to-playlist all come free from `SongItem`.
- [ ] After a query: unchanged (results grid / "No songs found").
- [ ] Optional: a short label distinguishing the default browse view from results.

**Tradeoffs / notes**
- `getSongs()` shows a signed-in viewer their own private songs too (the documented
  Home deviation, 08). Acceptable and consistent with Home. If the search default must
  be strictly public, add a small `.eq('is_public', true)` variant fetcher.
- "Recently searched" (localStorage chips) was considered but adds client state for
  little portfolio payoff; can layer on later.

---

## 3. Tooltips for discoverability

**Decision:** one reusable Radix-based tooltip, applied to icon-only controls.

**New dependency (needs approval):** `@radix-ui/react-tooltip` — consistent with the
existing Radix Dialog/Slider usage, accessible, tiny. **Add it to `code-standards.md` →
Dependencies before installing.**

**Plan**
- [ ] Add `@radix-ui/react-tooltip` to the approved-deps list, then `npm install` it.
- [ ] New `src/components/Tooltip.tsx` — thin wrapper (`<Tooltip label="Add song">`)
      styled with tokens (`bg-surface-2`, `shadow-dialog`, `text-xs`, small delay).
- [ ] Mount one `Tooltip.Provider` (in `layout.tsx` or a provider) wrapping the tree.
- [ ] Apply to icon-only buttons: Header (`+` upload, create-playlist), player
      (prev / play-pause / next / mute / shuffle / more-like-this), `LikeButton`,
      `AddToPlaylistButton`, sidebar nav on the `md` icon rail, `PlaylistHeaderActions`.
- [ ] Replace ad-hoc `title=` attributes (BottomNav, etc.) where the styled tooltip is
      used; keep `aria-label` everywhere for a11y.

**Tradeoffs / notes**
- A pure CSS/`title` approach avoids the dep but can't match the design tokens or
  hover delay; Radix is the cleaner, consistent choice given the stack.

---

## 4. Modernize the overall UI

**Decision:** **evolve the design system first.** Because `DESIGN-spotify.md` is the
locked visual source of truth and the invariants forbid inventing visual design, the
**first task is to update that file** with the new direction; implementation then
matches the doc. This is the largest area — sequence it after the quick wins.

**Plan — Step A: update `DESIGN-spotify.md`**
- [ ] Specify the **sticky top navigation**: left logo/name, center-left search bar,
      right login/profile + actions; responsive collapse rules.
- [ ] Specify the refreshed **visual hierarchy**: spacing scale, typography roles,
      card layout, borders/shadows, hover/active states — staying Spotify-inspired but
      original (per the branding/legal note).
- [ ] Add any new `@theme` tokens required, in `architecture.md` → Key Patterns.

**Plan — Step B: implement to match**
- [ ] Convert `Header.tsx` to a fixed/sticky top bar; integrate a persistent search bar
      that routes to `/search?q=` (reuse the URL-driven `SearchInput` contract; the
      `/search` page stays the source of truth). Collapse search to an icon < `md`.
- [ ] Apply the new spacing / type / card / hover-active treatments across `SongItem`,
      `SongGrid`, sidebar, modals.
- [ ] Re-verify responsiveness at 375 / 768 / 1024 / 1440 (sidebar rail/full, grid
      1→2→3→4→5, player bar fixed full-width) — the layout contract in
      `code-standards.md` must still hold.

**Tradeoffs / notes**
- Moving search into a persistent header is an **IA change** (today search is a page you
  navigate to). Keep `/search` working for shareable URLs and the default browse view (#2).
- A persistent header competes for vertical space with the fixed player bar on small
  screens — validate the mobile layout carefully.

---

## 5. Enhance the play bar

**Decision:** add **Shuffle**, and replace the undefined **"Remix"** with **"More like
this"** (queue other songs by the current track's author). Algorithmic radio/recs stay
out of scope; author-based queueing uses real data.

**Plan — Shuffle**
- [ ] Extend `src/stores/use-player.ts` with shuffle state (`isShuffled` + keep the
      original order so it can be restored) — still ephemeral player state, allowed.
- [ ] Shuffle button in `PlayerContent.tsx` controls cluster; next/prev walk the
      shuffled order; toggling off restores the launched-from order.
- [ ] Active styling = accent green (functional highlight, allowed by DESIGN §7).

**Plan — "More like this"**
- [ ] New read `src/server/get-songs-by-author.ts` (or a browser-client hook) —
      RLS-scoped (public + own), excludes the current track.
- [ ] Button appends those songs to the queue after the current track (`setIds`).
      Toast if none found.
- [ ] Tooltip (#3) labels both buttons.

**Tradeoffs / notes**
- "More like this" by author is intentionally simple/honest — no fake ML. If the
  catalog is thin (currently ~1 public song) it may find nothing; the empty toast
  handles that. Seeding more demo songs (see progress-tracker out-of-scope list) makes
  both shuffle and this feature demo better.

---

## Suggested build order

1. ~~**#1 Portfolio links**~~ — ✅ **done (2026-06-13)**.
2. **#2 Search default** — quick, real data. ← **next**
3. **#3 Tooltips** — reusable; also feeds the new #5 buttons.
4. **#5 Play bar** (shuffle + more-like-this) — medium.
5. **#4 UI modernization** — largest; design-doc update → implement. Sequenced last
   so the smaller tweaks don't get reworked.

> Each numbered area should be built **one fully before the next** (code-standards), and
> `progress-tracker.md` updated as they complete. None of these are committed yet — the
> owner controls doc/feature commits.
