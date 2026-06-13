# SpotifyAgain — v2 Change Ideas

> Scratchpad + live progress tracker for the next round of changes. Each item records its
> **decision**, the **how** (implementation approach), and **status**. Once all are built, this
> folds into the canonical context docs (a new **Phase 10** in `context/build-plan.md`, status in
> `context/progress-tracker.md`, detail in `context/build-journal.md`), then this file is retired.

## Ground rules (still apply)

- `context/architecture.md` **invariants** hold — Supabase clients only in `src/lib/supabase/`,
  all DB writes via `src/actions/*` Server Actions (re-check `getUser()`), Zustand holds
  ephemeral UI/player state only, RLS unchanged.
- `context/DESIGN-spotify.md` is the **visual source of truth** — style with existing `@theme`
  tokens; any new visual direction is added there first.
- **New dependencies** need approval + an entry in `context/code-standards.md` → Dependencies.

## Progress (2026-06-13)

| # | Change | Status |
| --- | ------ | ------ |
| 1+5 | Fixed app-shell + full-width header | ✅ **done — user-verified live** |
| 2 | Personal nav items prompt sign-in (anon) | 🔨 **next** — approach set, **code not yet written** |
| 3 | Remove duplicate search bar on `/search` | ⬜ pending |
| 4 | Stronger hover feedback (green glow) | ⬜ pending |

Legend: ✅ done · 🔨 in progress / next · ⬜ pending.

---

## 1 + 5 — Fixed app-shell + full-width header  ✅ DONE (user-verified)

**Problem:** (1) on desktop the header only spanned the content column (sat to the *right* of the
sidebar), not full width. (5) on scroll the header + sidebar "jiggled" (header was `sticky`, not truly
fixed); only the player bar was fixed.

**Decision:** header = full-width bar fixed across the very top (above the sidebar); sidebar fixed on
the left **between** header and player (not full height); player fixed bottom; **only `<main>` scrolls.**

**How (implemented):**
- `layout.tsx` — body → `h-dvh overflow-hidden`; `Header` / `Sidebar` / `main` / `PlayerBar` / `BottomNav`
  are now fixed direct children. `<main>` is the sole scroller: `fixed inset-x-0 top-16 bottom-24
  overflow-y-auto`, offset `md:left-24 lg:left-64` for the sidebar, `pb-28 md:pb-6` to clear the mobile
  BottomNav. Top-gradient + mobile portfolio footer kept inside `<main>`.
- `Header.tsx` — `fixed inset-x-0 top-0 z-30 h-16` full-width top bar (was `sticky top-0`).
- `Sidebar.tsx` — `fixed left-0 top-16 bottom-24 z-20 overflow-y-auto` (inset between header & player;
  scrolls internally; no longer full height).
- `DESIGN-spotify.md` §10.1 — rewritten to the fixed full-width app-shell (sanctioned design change).
- Chrome stays at `z-30`/`z-20`, below the modal overlay (`z-40`) so modals still cover it.

**Verified:** `npm run lint` + `npx tsc --noEmit` clean; **user confirmed working live** on the dev
server (2026-06-13).

---

## 2 — Personal nav items prompt sign-in when logged out  🔨 NEXT (code not yet written)

**Problem:** the sidebar + bottom nav show **Library** to logged-out users, but clicking it silently
redirects home — feels broken. (Liked Songs is currently hidden for anon.)

**Decision (A):** show **both** personal items (**Library + Liked Songs**) to anon in the sidebar and
bottom nav; clicking either while logged out **opens the sign-in modal** instead of navigating.

**How (planned):**
- `Sidebar.tsx` + `BottomNav.tsx`: add a `requiresAuth` flag to each nav item; show **all four**
  (Home, Search, Library, Liked Songs) to everyone (drop the current "hide Liked for anon" logic).
- In the render, when `requiresAuth && !user`, render a `<button onClick={useAuthModal().onOpen}>`
  styled identically to the nav link (same `className`, keep the Tooltip + `aria-label`) instead of a
  `<Link>`. Signed-in users get the normal `<Link>`; the active-highlight only applies to the link.
- No new deps; no store/RLS changes.

**Touches:** `Sidebar.tsx`, `BottomNav.tsx`.

---

## 3 — Remove the duplicate search bar on `/search`  ⬜ PENDING

**Problem (screenshot-confirmed):** the global **header search** and the `/search` page's own
`SearchInput` are identical and stack on top of each other on `/search`.

**Decision (A):** drop the page's `SearchInput`; the **header search drives `/search`** (already routes
to `/search?q=`). The page keeps its `Search` heading + recently-added/results body, reading `?q=`.

**How (planned):**
- `search/page.tsx`: remove the `<SearchInput>` render + its import; keep the heading and the
  `query ? results : recently-added` body unchanged.
- `SearchInput.tsx` likely becomes unused → check for other importers, then delete it.

**Touches:** `search/page.tsx`, `SearchInput.tsx` (likely deleted).

---

## 4 — Stronger hover feedback (green glow)  ⬜ PENDING

**Problem:** hover states feel dull/confusing on **both** the song cards and nav/buttons.

**Decision (B):** add a **subtle green hover/active glow** to interactive cards + buttons — a sanctioned
`DESIGN-spotify.md` §7 change (hover/active is a *functional state*, not decoration).

**How (planned):**
- `DESIGN-spotify.md` §7 **first** — document the green hover/active glow as a sanctioned functional cue.
- `globals.css` — add a green-glow shadow token to `@theme` (e.g. `--shadow-glow`) so it isn't a raw
  inline value.
- Apply on hover to `SongItem` (card) + nav/header action buttons; keep it subtle; confirm it reads as
  feedback, not decoration. Re-tune against the now-final shell.

**Touches:** `DESIGN-spotify.md` §7, `globals.css`, `SongItem.tsx`, nav/button hover classes.

---

## Build order

1. ✅ **#1+#5 fixed shell** — done (user-verified).
2. 🔨 **#2 anon sign-in prompt** — next.
3. ⬜ **#3 search dedupe.**
4. ⬜ **#4 hover green glow.**
