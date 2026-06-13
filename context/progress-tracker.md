# Progress Tracker

> **Role:** Live build status — what's done, in progress, and next.
> **Read at the start of every session**; **update after every completed feature.**
> **Relates to:** mirrors `build-plan.md` exactly. Full per-feature history (verbatim
> decisions + verification logs) lives in `context/build-journal.md` — this file keeps
> only the live status, the checklist, and the durable gotchas distilled from it.

---

## Current Status

**Phase:** v1 **COMPLETE (16/16)**, live + LIVE-VERIFIED 2026-06-12 ("everything working fine") at **https://spotifyagain.onrender.com**. **Phase 9 — Post-v1 Enhancements: all 5 built** (merged into `main`; single-branch repo). **Phase 10 — v2 UI Refinements (22–25): all 4 built and user-verified live** (2026-06-13). **Phase 11 — Sectioned Home (26): built, tsc+lint clean; live-verify pending.** **#20 (play bar) still awaits a live check**; everything else owner/user-verified.
**Last completed:** 26 Sectioned Home — Home restructured from one flat grid into labeled shelves ("Recently added" + signed-in-only "Made by you" / "Liked songs" + "Browse by artist" author-grouped rows for ≥2-song artists; today "Night Runners" ×3). New `src/server/optional-user.ts` (`getOptionalUser`, no redirect) + pure `src/lib/artists.ts` (`groupSongsByAuthor`); `page.tsx` parallelizes reads. Honest-data-only sections (no "made for you" — out of scope). tsc + lint clean; **not yet live-verified or committed.**
**Next:** Live-verify **26** (Home sections render: anon sees Recently added + Browse by artist→Night Runners; owner also sees Made by you / Liked songs). Also still pending: live-verify **20** (play bar — exercise against the seeded Night Runners cluster), then `/imprint` the new components (Phase 9–11) into `ui-registry.md`. Uncommitted on `main` (owner decides when to commit; now includes the seed script + Phase 11). The GitHub repo is **public**; Render redeploys from `main`.

---

## Progress

### Phase 1 — Foundation & Shell
- [x] 01 Project scaffold
- [x] 02 App shell layout
- [x] 03 Supabase clients & middleware

### Phase 2 — Authentication
- [x] 04 Google sign-in
- [x] 05 Action gating, profiles & sign-out

### Phase 3 — Songs & Upload
- [x] 06 Database schema & storage
- [x] 07 Upload song flow
- [x] 08 Home & library wired to real songs

### Phase 4 — Playback
- [x] 09 Persistent player
- [x] 10 Queue, next & previous

### Phase 5 — Library & Likes
- [x] 11 Like / unlike & Liked Songs
- [x] 12 Library polish

### Phase 6 — Playlists
- [x] 13 Create, rename & delete playlists
- [x] 14 Playlist tracks & detail page

### Phase 7 — Search
- [x] 15 Search page

### Phase 8 — Deployment
- [x] 16 Deploy to Render

### Phase 9 — Post-v1 Enhancements (merged into `main`)
- [x] 17 Portfolio links integration (area #1)
- [x] 18 Search default content (area #2)
- [x] 19 Tooltips for discoverability (area #3)
- [ ] 20 Enhance the play bar (area #5) — built; ⏳ live-verify pending
- [x] 21 UI modernization v2 (area #4)

### Phase 10 — v2 UI Refinements (folded in from the retired root `v2-changes.md`)
- [x] 22 Fixed app-shell + full-width header
- [x] 23 Personal nav items prompt sign-in (anon)
- [x] 24 Remove duplicate search bar on `/search`
- [x] 25 Stronger hover feedback (green glow)

### Phase 11 — Sectioned Home
- [ ] 26 Sectioned Home — built (tsc+lint clean); ⏳ live-verify pending

---

## Durable decisions & gotchas

The non-obvious things worth carrying forward — distilled from the per-feature log in
`context/build-journal.md` (consult it for the full context behind any item).

### Framework / build
- **`text-base` is a Tailwind v4 font-size utility, NOT a color** — it collides with the
  `--color-base` token. Use `text-black` for the `#000` play/CTA icon (02, 04).
- **`src/proxy.ts` (Next 16's renamed `middleware.ts`) must live in `src/`, not repo root** —
  a root one is silently ignored. Build prints `ƒ Proxy (Middleware)` only when correct (03).
- **React 19 `react-hooks/set-state-in-effect`** forbids synchronous `setState` in an effect
  body. Put setState in handlers / async callbacks, use RHF `reset`, or reseed via a `key`
  remount instead. Bit features 04/05/09/13/14/15 (04).
- App Router `_`-prefixed folders are **private folders**, excluded from routing (404) (03).
- `getUser()` for an anonymous request returns `{ user: null, error: "Auth session missing!" }`
  — the **expected** no-session state. Gate on `!user`; never surface that error (03).

### Auth / deploy
- **OAuth callback must redirect to `NEXT_PUBLIC_SITE_URL ?? origin`**, never
  `new URL(request.url).origin` — behind Render's proxy that resolves to the internal
  `localhost:PORT`. (Now also documented in `code-standards.md`.) (16)
- **`NEXT_PUBLIC_*` vars are build-time inlined** — changing `NEXT_PUBLIC_SITE_URL` on Render
  requires a **rebuild**, not a restart. No trailing slash (app builds `${SITE_URL}/auth/callback`) (16).
- `profiles` is written **only** by the `security definer` `handle_new_user` trigger (no INSERT
  policy); the `.sql` in `supabase/migrations/` is the source of truth even when applied via the
  dashboard. Re-run migrations against prod only if a **fresh** Supabase project is used (05/06).

### Data / Supabase
- **Home shows the viewer's own private songs** too: `getSongs()` is `select('*')` with no
  `is_public` filter (RLS still hides private rows from *other* users). Deliberate; add
  `.eq('is_public', true)` if Home must be strictly public-only (08).
- **Many-to-one embeds mis-infer types** (`select('songs(*)')` → `any[]`). Override with
  `.returns<{ songs: Song }[]>()` — no `any`, no cast (11; same pattern in `get-playlist-songs`).
- **Playlist reorder rewrites every `position` via sequential UPDATEs — safe because there is NO
  `unique(playlist_id, position)` constraint** (only `unique(playlist_id, song_id)`). Remove leaves
  position gaps on purpose; every read is `order('position', asc)`. Duplicate-add maps `23505` to a
  friendly message via the error-code allowlist (14).
- Storage buckets are created **in the migration** (public-read = "unlisted" privacy only), not the
  dashboard, to keep migrations the single source of truth (06).
- `searchSongs` **must sanitize** the query before interpolating into `.or()` (strip filter-grammar
  chars, escape `ilike` wildcards) — see `code-standards.md` → Boundary Patterns (15).

### UI / deps
- **@dnd-kit uses the CLASSIC API** (`DndContext`/`SortableContext`/`useSortable` + sensors), not
  `@dnd-kit/react`. Drag handle needs `touch-none`; `PointerSensor` `activationConstraint.distance: 5`
  so a click-to-play isn't read as a drag (14).
- Accent green is **functional-only** (play/active/CTA). Destructive = `bg-negative`; visibility badge
  + secondary CTAs stay achromatic / use `variant="white"` (12/13).

### Post-v1 enhancements (17–21)
- **Sidebar-footer clearance (17):** the portfolio footer hid behind the `fixed h-24` player bar — the
  `<aside>` needs its own `pb-24` (the `<main>` already had `md:pb-24`). Durable app-shell rule.
- **Top-gradient stacking (21):** an `absolute` top-of-content gradient renders ABOVE static siblings —
  give it `-z-10` and make `<main>` `relative` so content sits on top.
- **Tailwind v4 gradient (21):** used a token-based `@utility top-fade` (linear-gradient
  `var(--color-surface)`→transparent), not a `bg-gradient`/`bg-linear` class (v4 naming ambiguity).
- **Client search can't import server reads (20/21):** `'use client'` components can't import
  `src/server/*`, so the header live-search uses a **browser-client** hook (`useSearchSongs`, RLS-scoped,
  limit 6) and shares `sanitizeSearchQuery` from `src/lib/search.ts` with the server `searchSongs`. Same
  reason "more like this" is a browser-client hook (`useMoreLikeThis`), not a `src/server/*` read.
- **Shuffle lives in `setIds` (20):** shuffle is a persistent global toggle in `use-player`; reshuffling a
  newly-launched list happens inside `setIds` (not `useOnPlay`), so every play entry point inherits it.
- **`DESIGN-spotify.md` §10 is authoritative** for the modernized header / search dropdown / card
  hover-lift / section rhythm / top gradient — the only sanctioned post-v1 design-doc change (21).
- **GitHub repo is PUBLIC** (verified 2026-06-13, `isPrivate:false`) → the #17 portfolio link resolves
  for logged-out recruiters (17). LinkedIn URL format-valid but not bot-verifiable.

### v2 UI refinements (22–25)
- **Fixed app-shell (22):** the whole chrome is `fixed` and **only `<main>` scrolls** — `<main>` is
  `fixed inset-x-0 top-16 bottom-24 overflow-y-auto`, offset `md:left-24 lg:left-64`. Header full-width
  `top-0 h-16` **above** the sidebar; sidebar inset `top-16 bottom-24` (not full height, scrolls
  internally). Chrome `z-30`/`z-20` < modal overlay `z-40`. `DESIGN-spotify.md` §10.1 is authoritative.
- **Anon nav (23):** `Sidebar` + `BottomNav` map a 4-item `navItems` with a `requiresAuth` flag; an anon
  click on Library/Liked opens the `AuthModal` (renders a `<button>`) instead of `<Link>` — never a
  silent redirect home.
- **Search dedupe (24):** `/search` has NO page-level input; the global `HeaderSearch` (app shell) drives
  it via `?q=`. The page grid updates on a **committed** query (Enter / "Show all results"), not
  per-keystroke. `SearchInput.tsx` was **deleted** (was imported only by the page); `useDebounce` stays
  (used by `HeaderSearch`).
- **Green glow (25):** sanctioned `DESIGN-spotify.md` §7 **exception** — a subtle green hover/
  `focus-visible` glow as *functional* feedback (not decoration). Tokens `--shadow-glow` (halo only) /
  `--shadow-card-glow` (card lift + halo) in `@theme` — **Tailwind `shadow-*` utilities don't stack**
  (each sets `box-shadow`), so the card needs the combined token. Restrained scope: `SongItem` cards +
  the header upload / create-playlist buttons only; NOT nav links or the white OAuth button.

### Sectioned Home (26)
- **`getOptionalUser` vs `requireUser` (26):** public pages with signed-in-only sections (Home) read
  the user with **`src/server/optional-user.ts` → `getOptionalUser()` (returns `User | null`, NEVER
  redirects)** — using `requireUser()` would wrongly bounce anonymous visitors off Home. Personal pages
  still use `requireUser()`.
- **Artist shelves are author-grouped rows with a ≥2-song threshold (26):** `src/lib/artists.ts`
  `groupSongsByAuthor(songs, minSongs=2)` (pure) — single-song artists would be one-card shelves, so they
  stay in "Recently added"; only ≥2-song authors get a "Browse by artist" shelf (today: Night Runners ×3).
  Grouping runs on the **already RLS-scoped** `getSongs()` list, so it never widens visibility.
- **Honest sections only (26):** Home sections derive from real data (recency / author / ownership). No
  "made for you" / recommendations / trending — out of scope per `project-overview.md` AND we have no
  play-history/taste/genre signal to make them real (a fake label hurts a portfolio piece).

---

## Out-of-scope polish (if asked)

- **Seed demo songs — ✅ DONE (2026-06-13).** Catalog went from **1 public song → 19** (20 total; the
  20th is a pre-existing private song). Ran `npm run seed:songs` (`scripts/seed-songs.mjs`): uploaded the
  18 bundled royalty-free demo clips from local `Songs/public/*` (gitignored) to Storage + inserted
  `is_public` rows as the owner via the **service-role key** (architecture-sanctioned local seed task;
  needs `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`). Resolves the owner by `SEED_USER_EMAIL`, idempotent
  on `(title, author)`. Relabeled 3 neon tracks → **"Night Runners"** (3-track cluster) so **#20 is now
  demoable**. The 3 top-level `Songs/*.mp3` were **copyrighted Bollywood tracks — excluded from the seed.**
  **The local `Songs/` asset folder was deleted after seeding** (was gitignored), so `scripts/seed-songs.mjs`
  can't be re-run until the 18 tutorial clips + covers are re-fetched into `Songs/public/{songs,cover-images}/`.
  Not needed unless re-seeding a fresh Supabase project.
- **`/imprint` the post-v1 + v2 components** into `ui-registry.md` — Tooltip, player shuffle /
  more-like-this, Header, `SongItem` hover-lift, `HeaderSearch` dropdown (Phase 9); the fixed app-shell
  (header/sidebar/main offsets), the green hover/focus glow (`--shadow-glow` / `--shadow-card-glow`), and
  the anon sign-in-prompt nav pattern (Phase 10). Only `PortfolioLinks` + the `pb-24` rule recorded so far.
- Bump Render free → Starter to kill the ~50s cold start.
- README / portfolio write-up.

## Untested (not single-account testable)

Cross-user negative RLS paths — visibility-gated INSERTs on `liked_songs`/`playlist_songs`,
reorder/remove on a non-owned playlist, cross-user `/playlist/[id]` + search visibility. All
validated **structurally** in Feature 06; need a 2nd real auth user to exercise at runtime.
