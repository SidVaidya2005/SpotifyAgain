# Progress Tracker

> **Role:** Live build status — what's done, in progress, and next.
> **Read at the start of every session**; **update after every completed feature.**
> **Relates to:** mirrors `build-plan.md` exactly.

Update this file after every completed feature. Any AI agent reading this should
immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 3 — Songs & Upload (complete) → Phase 4 — Playback (next)
**Last completed:** 08 Home & library wired to real songs (real catalog reads replace MOCK_SONGS; new `/library` page; `SongGrid` extracted; lint + build green; populated grid + anon RLS visibility + library gating verified headlessly via a temp sentinel song)
**Next:** 09 Persistent player

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
- [ ] 09 Persistent player
- [ ] 10 Queue, next & previous

### Phase 5 — Library & Likes
- [ ] 11 Like / unlike & Liked Songs
- [ ] 12 Library polish

### Phase 6 — Playlists
- [ ] 13 Create, rename & delete playlists
- [ ] 14 Playlist tracks & detail page

### Phase 7 — Search
- [ ] 15 Search page

### Phase 8 — Deployment
- [ ] 16 Deploy to Render

---

## Decisions Made During Build

- **01 — Next.js 16, not 15.** `create-next-app@latest` now ships Next.js
  **16.2.9** (with React 19.2.4, Tailwind v4). Chose to adopt 16 rather than pin
  to the originally-documented 15; the context docs (`architecture.md`,
  `code-standards.md`, `library-docs.md`, `build-plan.md`, `CLAUDE.md`) were
  updated to say 16. The async `cookies()`/`params`, middleware, and Server
  Action patterns those docs rely on are unchanged in 16, so no other guidance moved.
- **01 — Scaffolded via temp dir + merge.** Repo root was non-empty (`CLAUDE.md`,
  `context/`), so `create-next-app .` won't run; scaffolded in a temp dir and
  rsync-merged in, preserving the existing `CLAUDE.md`/`context/`/`LICENSE`/`README.md`.
- **01 — Installed all approved deps up front** (per build-plan §01), not lazily.
- **01 — Kept feature 01 a blank page.** `globals.css` is just
  `@import "tailwindcss"`; design tokens, Figtree, dark theme, and the shell are
  deferred to feature 02, per the build-plan split.
- **01 — Pinned `turbopack.root`** in `next.config.ts` to this project. A stray
  `package-lock.json` in the home dir made Next/Turbopack infer the wrong
  workspace root; pinning silences the warning and keeps file tracing/env
  resolution correct (locally and on Render).
- **01 — No `tailwind.config.ts`.** Tailwind v4 is CSS-driven; none created.

---

## Notes

- **02 — Separate `<Sidebar>` and `<BottomNav>` components.** Chose distinct components over a single responsive variant component — cleaner separation of concerns, easier to extend per-layout if needed. Icon rail at `md` uses `md:block lg:hidden` to show a music note (♫), full text labels at `lg`+.
- **02 — Song type created early.** `src/types/index.ts` defines `Song` and `ActionResult<T>` now; Supabase types (Feature 06) will replace it without refactoring the grid/card components.
- **02 (verification pass) — audit fixes applied.** Reviewed the shell against
  `DESIGN-spotify.md`/`code-standards.md` and corrected: (1) **`text-base` is a
  Tailwind v4 font-size utility, NOT a color** — it collides with the `--color-base`
  token, so the play-button icon was rendering white. Use `text-black` for the
  `#000000` play icon; never use `text-base` expecting the base color. (2) `<main>`
  bottom padding now `pb-48 md:pb-24` so mobile content clears both the BottomNav
  and player bar. (3) Removed raw gray `border-border` dividers (DESIGN §7) — sidebar
  relies on `bg-surface`/`bg-base` shade contrast; BottomNav uses a 1px inset
  `shadow-[0_-1px_0_var(--color-base)]` seam. (4) Home `<h1>` → `text-2xl` (24px
  Section Title). (5) a11y: `aria-label`s on sidebar/player icon buttons, centered
  md icon-rail, ≥44px prev/next touch targets. (6) Renamed `SongCard` → `SongItem`
  to match `architecture.md`. Lint + `next build` green.
- **03 — Root entry is `src/proxy.ts`, not `middleware.ts`.** Context7's Next 16
  upgrade guide + the installed `next@16.2.9` (which carries **both**
  `MIDDLEWARE_FILENAME='middleware'` and `PROXY_FILENAME='proxy'` constants) confirm
  `middleware.ts`/`export middleware` are **deprecated** and renamed to
  `proxy.ts`/`export proxy` (nodejs runtime; no edge). Adopted `proxy.ts` to avoid
  the deprecation warning and stay current. Updated `architecture.md`,
  `library-docs.md`, `build-plan.md` to match.
- **03 — The proxy lives in `src/`, not the repo root.** With a `src/` app dir,
  Next only detects the request entry at `src/proxy.ts`; a repo-root `proxy.ts` was
  **silently ignored** (empty `middleware-manifest.json`, no `Proxy` line in the
  build output). The context docs originally placed it at root — corrected to
  `src/proxy.ts`. Confirmation signal: `npm run build` prints `ƒ Proxy (Middleware)`
  only when the file is in `src/`.
- **03 — `getUser()` for an anonymous request returns `{ user: null, error: "Auth
  session missing!" }`** — this is the **expected** no-session state, not a failure.
  All patterns gate on `!user` and ignore that error; never surface it.
- **03 — Committed `.env.example` template** (un-ignored via `!.env.example` in
  `.gitignore`) documents the three `NEXT_PUBLIC_*` keys for reviewers; real creds
  live in the gitignored `.env.local`. `next.config.ts` `images.remotePatterns` is
  pinned to the specific project host (`vgsiwqrovctitxkruwpj.supabase.co`), scoped to
  `/storage/v1/object/public/**`.
- **03 — Private-folder gotcha (noted during verification).** App Router folders
  prefixed with `_` (e.g. `__verify`) are **private folders** excluded from routing
  and 404 — relevant for any future opt-out segment naming.
- **03 — Verified end-to-end:** lint + `next build` green (no deprecation warning);
  dev server `/` → 200 for anon with `proxy.ts` running and `getUser()` → `null`
  clean; `/library` & `/liked` → 307 → `/`; a non-protected path 404s without
  redirect; a temporary Server Component confirmed the server client constructs and
  `getUser()` resolves cleanly, then was removed. No UI/providers added (those are 04+).
- **04 — Built option-b** (full flow + UI now; Supabase dashboard configured
  separately, live round-trip tested after). New: `use-auth-modal` store; `Button`
  primitive (`pill`/`white`/`outline`); reusable `Modal` Radix-Dialog shell;
  `modals/AuthModal` ("Continue with Google" → `signInWithOAuth`); `UserProvider` +
  `hooks/useUser`; `ModalProvider`; `ToasterProvider`; `Header`; `auth/callback/route.ts`.
  `layout.tsx` is now an **async server component** that reads `getUser()` and seeds
  `UserProvider` (no logged-out→logged-in flicker); Header sits in a new content
  column above `<main>`.
- **04 — Auth surface = top `Header`, not the sidebar.** Real triggers (upload/like/
  playlist) don't exist yet, so a "Log in" pill in a new Header is the visible entry
  point at all breakpoints; signed-in state shows a minimal initial-circle only
  (avatar + sign-out menu is **05**). Wordmark shown in Header only below `md` (sidebar
  carries it ≥`md`).
- **04 — `useUser` is client context, server-seeded.** `UserProvider` seeds from the
  layout's `getUser()` and stays live via `onAuthStateChange`; `useUser` just reads the
  context (throws outside the provider). Stores still never call Supabase.
- **04 — `ReactQueryProvider` deferred to Feature 11** (likes); 04 doesn't use it.
  Only `UserProvider`/`ModalProvider`/`ToasterProvider` mounted now.
- **04 — Dropped the modal "mounted-guard".** New React 19 lint rule
  (`react-hooks/set-state-in-effect`) forbids `setState` synchronously in an effect, so
  the classic `useState(false)`+`useEffect(setIsMounted(true))` guard now errors. It's
  unnecessary anyway: each modal's `open` starts `false` on server and client (Radix
  portals content only when open) → no hydration mismatch. `ModalProvider` just renders
  `<AuthModal />`.
- **04 — `text-black` is the play/CTA-icon black** (built-in Tailwind `#000`); do NOT use
  `text-base` (that's a font-size util colliding with `--color-base`, per the 02 note).
- **04 — Verified (headless):** lint + `next build` green; build still prints
  `ƒ Proxy (Middleware)`; `/` now `ƒ (Dynamic)`. Dev: anon `/` → 200 with the **Log in**
  button present in SSR HTML (server-seed, no flicker); `/auth/callback` (no code) →
  307 → `/`; `/library` (anon) → 307 → `/`; clean dev log.
- **04 — Live OAuth round-trip verified.** Google provider enabled in Supabase Auth,
  `http://localhost:3000/auth/callback` allowlisted, Supabase callback added to the
  Google Cloud OAuth client. Modal → Google consent → `/auth/callback` → back to `next`
  works; Header shows the signed-in initial-circle. (Dashboard/Google Cloud config is
  external, not in the repo — must be repeated for the Render URL at deploy, Feature 16.)
- **05 — Auth surface stayed in the `Header`, not the sidebar.** Build-plan §05 text
  says "Sidebar shows avatar + sign-out," but the sidebar is hidden below `md`, so a
  sidebar-only control would strand mobile users. Kept the 04 decision: avatar + account
  dropdown live in the top `Header` (reachable at every breakpoint). New `UserMenu`
  replaces 04's minimal initial-circle.
- **05 — Sign-out = lightweight custom dropdown, no new dep.** Avatar button toggles a
  small menu (name label + `Log out`), closes on click-outside / Escape. Avoided adding
  `@radix-ui/react-dropdown-menu`. The close-listener `useEffect` only attaches/detaches
  document listeners (state set inside handlers) so it doesn't trip React 19's
  `set-state-in-effect` rule (same gotcha noted in 04). Sign-out is **client-side**
  (`supabase.auth.signOut()` → `router.push('/')` + `router.refresh()`); it only clears
  the session cookie, so the "DB writes go through Server Actions" invariant doesn't apply.
- **05 — Real Google avatar now rendered.** `UserMenu` shows `user_metadata.avatar_url`
  via `<Image>` (initial-circle fallback when absent). Added `lh3.googleusercontent.com`
  to `next.config.ts` `images.remotePatterns` (`/**`). The Header avatar reads the live
  `User` object — it does **not** query the `profiles` table.
- **05 — `profiles` table + RLS + `handle_new_user` trigger** via
  `supabase/migrations/20260611202834_profiles_and_handle_new_user.sql`. Owner-only
  SELECT/UPDATE (`(select auth.uid()) = id`); **no INSERT policy** — the only writer is
  the `security definer`, `search_path = ''` trigger (fully-qualified tables,
  `on conflict do nothing`). Migration includes an **idempotent backfill** of existing
  `auth.users` (the Feature-04 user predated the trigger). Confirmed the canonical trigger
  form via Context7 (`/supabase/supabase`).
- **05 — Migration applied via the Supabase Dashboard SQL Editor**, not the MCP. The
  MCP OAuth completed in-browser ("authentication successful") but the harness didn't
  surface its real tools into the tool registry this session, so we ran the committed
  `.sql` in the dashboard instead. The `.sql` in `supabase/migrations/` remains the source
  of truth. Verified post-apply: `profile_count = user_count = 1`, `policy_count = 2`,
  `trigger_exists = true`. **Must also be run against the production DB at deploy if a
  fresh project is used (Feature 16).**
- **05 — `requireUser()` guard added but not yet consumed.** `src/server/require-user.ts`
  (`getUser()` → `redirect('/')` when null) codifies the "personal-page Server Component
  redirects when signed out" pattern. No personal page exists yet, so nothing imports it
  in 05 (verified by build, not runtime); Features 08 (`/library`), 11 (`/liked`), 14
  (`/playlist/[id]`) should call it at the top of their Server Components.
- **05 — Verified:** `npm run lint` + `npm run build` green (build still prints
  `ƒ Proxy (Middleware)`). Headless: anon `/` → 200 with "Log in" in SSR HTML;
  `/library` & `/liked` → 307 → `/`. Live (user-confirmed): real Google avatar renders;
  avatar → dropdown → `Log out` → back to `/` with the "Log in" pill; re-sign-in shows no
  duplicate profile (trigger `on conflict do nothing`).
- **06 — One additive migration** (`supabase/migrations/20260612015610_catalog_schema_and_storage.sql`)
  creates `songs`, `playlists`, `playlist_songs`, `liked_songs` + RLS + FK indexes, and the
  `songs`/`images` Storage buckets with policies. `profiles` untouched (already exists from 05).
  Matches the 05 SQL style (`(select auth.uid())` subselect wrapping, section dividers).
- **06 — Storage buckets created IN the migration** (`insert into storage.buckets ... public=true`
  + `storage.objects` policies), not the dashboard, so `supabase/migrations/` stays the single
  source of truth (invariant). Public-read = "unlisted" privacy only (object URLs aren't access-
  controlled), per architecture.md — `is_public` hides private rows from the catalog via RLS.
- **06 — `songs.song_path` / `image_path` are `NOT NULL`.** Every song needs audio + cover; this
  also keeps the generated `Song` field types `string` (not `string | null`), so the existing
  `MOCK_SONGS` + grid/card components type-check with zero changes. `playlists.description` /
  `image_path` stay nullable.
- **06 — `Song` is now a generated-type alias.** `src/types/index.ts` derives `Song`, `Playlist`,
  `PlaylistSong`, `LikedSong`, `Profile` from `Database['public']['Tables'][...]['Row']` (new
  `src/types/database.types.ts`); the hand-written `interface Song` was replaced. `ActionResult`
  unchanged. `STORAGE_BUCKETS` / `ACCEPTED_*` in `lib/constants.ts` already existed, untouched.
- **06 — Applied via Supabase MCP** (`apply_migration` → `{"success":true}`). MCP auth WAS
  available this session (unlike 05's dashboard fallback). Types via MCP `generate_typescript_types`.
- **06 — Verified:** MCP `get_advisors` (security) shows **no warnings on the 4 new tables**
  (only pre-existing lints: the 05 `handle_new_user` SECURITY DEFINER RPC-exposure + Auth leaked-
  password — neither introduced here). Structural: all 4 tables `relrowsecurity=true` with expected
  policy counts (songs 4, playlist_songs 4, liked_songs 3, playlists 1). `set role anon` insert into
  `songs` correctly **rejected** by RLS. Both buckets `public=true`. `npm run lint` + `npm run build`
  green (build still prints `ƒ Proxy (Middleware)`; `/` `ƒ (Dynamic)`); no UI change.
- **06 — Cross-user visibility-gated INSERT not yet runtime-tested.** The `liked_songs` /
  `playlist_songs` "can only reference a visible song" `with check` needs a 2nd real auth user +
  catalog data + live sessions to exercise; deliberately NOT faking a user in the prod `auth.users`.
  Real coverage comes with Features 08/11. Policy SQL validated structurally + against Context7.
- **06 — Must also run this migration against the production DB at deploy (Feature 16)** if a fresh
  Supabase project is used — same caveat as the 05 migration. Pre-existing 05 advisory
  (`handle_new_user` exposed as an RPC) is unrelated to 06 and left as-is (out of scope).
- **07 — New files:** `src/stores/use-upload-modal.ts` (mirrors `use-auth-modal`),
  `src/actions/create-song.ts` (first real Server Action), `src/components/modals/UploadModal.tsx`.
  Mounted `<UploadModal />` in `ModalProvider`; added a signed-in-only "+" upload button to `Header`.
  Pattern is verbatim from `library-docs.md` → "Upload" (client direct-to-Storage × 2, then the
  `createSong` action does the DB insert).
- **07 — Upload trigger lives in the `Header`, not the Sidebar/Library.** Build-plan §07 implies the
  Library, but `/library` doesn't exist until Feature 08/12 and the Sidebar is hidden below `md`. A
  signed-in-only "+" in the Header is reachable at every breakpoint; **move/duplicate it into the
  Library page when that lands**. Shown only when `user` is set (anon still sees "Log in"), so no
  AuthModal path is wired from it.
- **07 — Orphan cleanup implemented per invariant:** if the image upload or `createSong` fails after
  the audio object is stored, the client `storage.remove()`s the already-uploaded object(s) before
  toasting. `createSong` re-checks `getUser()` and inserts under the server-trusted `user.id` (the
  client path prefix from `useUser()` is also enforced by Storage RLS `foldername[1] = auth.uid()`).
- **07 — public/private is a plain native checkbox** ("Make this song public", default checked =
  public). `DESIGN-spotify.md` has no switch/toggle spec, so we used a token-styled checkbox
  (`accent-accent`) rather than invent a control. Inputs use the `shadow-inset-border` token +
  `bg-surface-2` (DESIGN §4 Inputs); file inputs styled via Tailwind `file:` variants.
- **07 — File-type validation:** `audioTypes`/`imageTypes` are `readonly string[]` views over the
  `ACCEPTED_*` `as const` tuples so `.includes(File.type)` type-checks without `any`. `accept`
  attrs derive from the same constants (`.join(',')`). Friendly toasts on bad type / missing file;
  inputs disabled while `isSubmitting`; modal won't close mid-submit.
- **07 — `router.refresh()` on success is a no-op visually for now** — Home still renders `MOCK_SONGS`
  and there's no `/library` page, so the uploaded song won't appear in the UI until **Feature 08**
  wires real reads (`createSong` already `revalidatePath('/')` + `'/library'` for then). Scope kept
  strict: 07 = upload only.
- **07 — Verified:** `npm run lint` + `npm run build` green (build still prints `ƒ Proxy (Middleware)`;
  `/` `ƒ (Dynamic)`). **Live upload round-trip user-confirmed working** (real MP3 + cover → toast →
  `songs` row + Storage objects). React Query NOT used here (deferred to Feature 11); success path is
  action `revalidatePath` + client `router.refresh()`. Note: uploaded song still won't *appear* in the
  UI until Feature 08 wires real reads (Home is still `MOCK_SONGS`).
- **08 — New files:** `src/server/get-songs.ts` (`getSongs()` — verbatim from `architecture.md` → Key
  Patterns), `src/server/get-songs-by-user.ts` (`getSongsByUser(userId)` — same shape + `.eq('user_id',
  userId)`), `src/components/SongGrid.tsx`, `src/app/(site)/library/page.tsx`. Modified
  `src/app/(site)/page.tsx` (deleted `MOCK_SONGS`; now `async`, reads `getSongs()`). Reads degrade
  gracefully (log `[getSongs]`/`[getSongsByUser]`, return `[]`); no mutations, no client fetching.
- **08 — Home shows "everything RLS allows", a conscious deviation.** `getSongs()` is `select('*')` with
  no `is_public` filter (the documented snippet). Anon sees only public songs (RLS); a **signed-in
  uploader also sees their own private songs on Home**. This softly differs from project-overview's "a
  private one appears only in the uploader's library" prose, but does **not** break the security
  invariant — RLS still hides private rows from *other* users. Chosen by the user during /architect over
  an explicit public-only filter. If we ever want Home strictly public-only, add `.eq('is_public', true)`
  to `getSongs` (Library would keep its own fetcher).
- **08 — `SongGrid` extracted as a shared presentational primitive** (Server-renderable, no `'use
  client'`): owns the responsive 1→2→3→4→5 grid + the minimal empty message (`emptyMessage` prop). Home
  and Library both render it; Liked/Search/Playlist will reuse it. Per code-standards "repeated patterns
  become primitives." `SongItem` left untouched — **cover art is still the grey placeholder** (no
  `<Image>`/`getPublicUrl` wiring; deferred). No click-to-play (Features 09–10).
- **08 — `/library` scope kept tight (build-plan §12 deferred).** Page = `requireUser()` →
  `getSongsByUser(user.id)` → `SongGrid` with a minimal "You haven't uploaded any songs yet." message.
  The **dedicated Library upload button, the public/private indicator badge, and the polished empty
  state stay in §12**. Upload affordance for Library users is the existing signed-in "+" in the `Header`
  (reachable at every breakpoint) — not moved/duplicated here.
- **08 — Verified:** `npm run lint` clean; `npm run build` green (`/` + `/library` both `ƒ (Dynamic)`;
  build still prints `ƒ Proxy (Middleware)`). Runtime (dev): anon `/` → 200 with no `MOCK_SONGS`; anon
  `/library` → 307 → `/`. **Populated + RLS path verified with a temp sentinel song:** inserted one
  public + one private `songs` row (under the lone real user) via the Supabase MCP → anon Home rendered
  **only the public** title in the grid, **private correctly hidden** → deleted both rows (`songs` count
  back to 0). **Still needs a user run** (same Google-OAuth/file-picker constraint as 07): the *signed-in*
  views — Home additionally showing the user's own private songs, `/library` listing the user's uploads —
  and the full 07→08 flow (upload via Header "+" → song appears on Home/Library immediately). Catalog is
  currently **empty** (0 songs); the Feature-07 test uploads were cleaned up at some point.
