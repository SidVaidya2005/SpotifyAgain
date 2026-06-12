# Progress Tracker

> **Role:** Live build status — what's done, in progress, and next.
> **Read at the start of every session**; **update after every completed feature.**
> **Relates to:** mirrors `build-plan.md` exactly.

Update this file after every completed feature. Any AI agent reading this should
immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 6 — Playlists **IN PROGRESS** (13 built, lint/build green, anon-gating headless-verified; **signed-in flow pending live user run**)
**Last completed:** 13 Create, rename & delete playlists — `use-playlist-modal` store (carries `editing` context), `PlaylistModal` (one modal, create/rename, title-only), `create`/`rename`/`delete-playlist` Server Actions, `useUserPlaylists` React Query hook, `get-playlist.ts` read, `PlaylistList` (sidebar, signed-in only), `PlaylistHeaderActions` (rename + confirm-dialog delete), and the owner-only `/playlist/[id]` page. Header gains a signed-in "Create playlist" button (mobile reach). **No schema/dep change** (`playlists` + RLS shipped in 06). Lint + build green (`/playlist/[id]` = `ƒ (Dynamic)`).
**Next:** Phase 6 — 14 Playlist tracks & detail page

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
- **09 — New files:** `src/stores/use-player.ts` (verbatim `architecture.md` shape: `ids`/`activeId` +
  `setId`/`setIds`/`reset`), hooks `useOnPlay` / `useGetSongById` / `useLoadSongUrl` / `useLoadImage`,
  and `src/components/player/{PlayerContent,SeekSlider,VolumeSlider}.tsx`. Rewrote
  `player/PlayerBar.tsx` (orchestrator) and made `SongGrid.tsx` + `SongItem.tsx` client components.
  No new deps, no migration, no `next.config.ts` / React Query change. (`/architect` plan:
  `~/.claude/plans/feature-09-persistent-cozy-boole.md`.)
- **09 — Store stays minimal; active song fetched, not stored.** Invariant forbids domain data in
  Zustand, and the layout-mounted `PlayerBar` has no page data, so it resolves the active `Song` from
  `activeId` via `useGetSongById` (browser client, RLS-scoped, plain `useEffect` — **React Query still
  deferred to 11**). `isPlaying`/`position`/`volume` are **local** to `PlayerContent`. `PlayerContent`
  is keyed by `songUrl` in `PlayerBar` so it remounts and `use-sound` reloads on track change; autoplay
  via `sound?.play()` on the `[sound]` effect, `sound?.unload()` on cleanup. Verified `use-sound@5` +
  Radix Slider APIs against Context7 first.
- **09 — Cover art wired (USER-CHOSEN).** `useLoadImage` → `getPublicUrl(image_path)` rendered via
  `<Image>` in both `SongItem` (grid) and `PlayerContent`. No `next.config.ts` change — the Supabase
  Storage host (`/storage/v1/object/public/**`) was already whitelisted in 03/05.
- **09 — Click model = hover Circular Play (USER-CHOSEN).** `SongGrid` is now a client component
  computing `onPlay = useOnPlay(songs)` and passing `onClick:(id)=>void` to `SongItem` (the shape in
  `code-standards.md` → Module Structure). The whole card is clickable **and** a green Circular Play
  button (`bg-accent text-black`, DESIGN §4/§9) reveals on card hover (`stopPropagation` on the button).
  No auth gate — anon may play public songs.
- **09 — Next/prev + onend auto-advance deliberately deferred to Feature 10 (USER-CHOSEN "keep split").**
  Prev/next buttons render for layout fidelity but have **no handler** (`TODO(Feature 10)` comments);
  `onend` only stops (no auto-advance). Seek (live position via a 500ms `sound.seek()` poll) + volume
  (`use-sound` reactive `volume` option) + mute toggle are functional now. Volume control is
  `hidden md:flex` (touch widths use hardware volume).
- **09 — Lint gotcha repeat:** React 19 `react-hooks/set-state-in-effect` flagged a *synchronous*
  `setState` in `useGetSongById`'s `!id` early-return; fixed by moving **all** setState into the async
  `run()` (deferred). Same rule bit 04/05.
- **09 — Verified:** `npm run lint` clean; `npm run build` green (`/` + `/library` both `ƒ (Dynamic)`;
  build still prints `ƒ Proxy (Middleware)`). Headless (dev on `PORT=3077`): anon `/` → 200 rendering the
  **idle player** ("Nothing playing" / "Pick a song to start") + empty grid ("No songs yet.") with the
  now-client `SongGrid`/`SongItem`/`PlayerBar` SSR-ing without hydration crash; anon `/library` → 307 → `/`.
  **Live browser run user-confirmed working** ("verified everything working fine"): actual audio playback
  (click → play, pause, seek, volume, mute), persistence across navigation, anon playback of a public
  song, and cover art all function. This live run **also finally cleared the pending 07→08 round-trip**
  (sign-in → upload → song appears → plays). Catalog now has real song(s) again.
- **10 — Single-file change** (`src/components/player/PlayerContent.tsx`); no new files/hooks/deps/
  migrations, no store change (`usePlayer` already had `ids`/`activeId`/`setId`). Added inline
  `onPlayNext` / `onPlayPrevious`, wired the previously-inert prev/next buttons, and pointed `use-sound`'s
  `onend` at `onPlayNext`. (`/architect` plan reused the feature-09 plan-file slug.)
- **10 — onend LOOPS (USER-CHOSEN).** `onend: onPlayNext` → the last track auto-advances to the first and
  the queue loops endlessly. Manual next wraps too (`ids[i+1] ?? ids[0]`). Matches build-plan "walk and
  wrap" + the architecture.md/library-docs pattern.
- **10 — Previous is Spotify-style (USER-CHOSEN).** Reads live elapsed via `sound.seek()`: **>3s in →
  restart** current track (`sound.seek(0)` + `setPosition(0)`); else step back one (`ids[i-1] ??
  ids[ids.length-1]`, wrap to last). Goes slightly beyond build-plan's plain "previous + wrap" by design.
- **10 — Handlers read `usePlayer.getState()`, not render-closure values**, so the `onend` callback
  use-sound captures at mount always walks the *current* `ids`/`activeId`. `PlayerContent` still takes
  title/cover from props (no new store subscription, no extra re-renders). Track changes ride the existing
  Feature-09 remount chain (`setId` → `PlayerBar` refetch → `PlayerContent key={songUrl}` remount → autoplay).
- **10 — Known edge:** a **single-item queue** does NOT replay on `onend` (`setId(sameId)` is a no-op → no
  remount). Acceptable; build-plan doesn't require single-track looping.
- **10 — Verified static + LIVE (user-confirmed 2026-06-12).** `npm run lint` clean; `npm run build`
  green (`/` + `/library` `ƒ (Dynamic)`; `ƒ Proxy (Middleware)` prints). **Live browser run with ≥2 public
  songs user-confirmed working:** next/prev advance + wrap, onend auto-advance + loop at end, previous
  restart-if->3s vs prior-track, and queue follows the launched-from list (Home vs `/library`). **Phase 4 —
  Playback now fully complete.**
- **11 — React Query finally mounted (deferred since 04).** New `src/providers/ReactQueryProvider.tsx`
  (verbatim from `library-docs.md`: `useState(() => new QueryClient({ queries: { staleTime: 60_000 } }))`),
  mounted in `layout.tsx` **just inside `UserProvider`, wrapping the whole tree** (shell + `PlayerBar` +
  `BottomNav`) so the grid hearts and the player heart share one cache. No new deps (`@tanstack/react-query`
  was already installed). No migration — `liked_songs` + RLS shipped in 06.
- **11 — New files:** `actions/toggle-like.ts` (verbatim from `code-standards.md` § Server Action:
  getUser re-check → `maybeSingle()` existence check → delete-or-insert → `revalidatePath('/liked')` →
  `{ data: { liked } }`); hooks `useLikedSongs.ts` (React Query `['liked-songs']` → `string[]` of liked
  song ids, **browser** client, `enabled: !!user`) + `useToggleLike.ts` (**optimistic** mutation);
  `components/LikeButton.tsx`; `server/get-liked-songs.ts`; `app/(site)/liked/page.tsx`.
- **11 — Heart placement = song cards + player bar (USER-CHOSEN).** `LikeButton` added to `SongItem`'s
  cover overlay (top-right, `revealOnHover`) and to `PlayerContent`'s left cluster (always visible — covers
  touch widths). `PlayerBar` **untouched**: `PlayerContent` already receives the full `song`, so it just
  reads `song.id` (no prop threading needed).
- **11 — Optimistic toggle (USER-CHOSEN).** `useToggleLike` flips the cached `['liked-songs']` id list in
  `onMutate` (after `cancelQueries` + snapshot), **rolls back + `toast.error` in `onError`**, and
  `invalidateQueries(['liked-songs'])` in `onSettled`. v5 optimistic pattern verified against Context7
  (`/tanstack/query`). All `LikeButton`s share the one query (React Query dedupes by key) so they stay in
  sync. `LikeButton.revealOnHover` keeps a card's heart hidden until hover **unless already liked** (liked
  hearts always show, accent-green).
- **11 — `getLikedSongs` embed typing gotcha.** `from('liked_songs').select('songs(*)')` is a many-to-one
  embed, but the generated types **mis-infer the embedded `songs` as `any[]`** (build failed: `any[][]`).
  Fixed with `.returns<{ songs: Song }[]>()` (idiomatic Supabase type override — no `any`, no cast); PostgREST
  returns one song object per like row at runtime. Ordered by `liked_songs.created_at desc` (newest like first).
- **11 — Nav entry = signed-in only (USER-CHOSEN).** `Sidebar` + `BottomNav` append
  `{ label: 'Liked Songs', href: '/liked', icon: FiHeart }` to their nav list **only when `useUser()` has a
  user**; hidden for anon. (Existing always-visible "Library" entry left as-is — minor pre-existing
  inconsistency, out of scope.) `/liked` is already proxy-gated (`protectedPaths` includes `/liked`) and the
  page calls `requireUser()`.
- **11 — Verified static + LIVE (user-confirmed 2026-06-12).** `npm run lint` clean; `npm run build` green
  (`/`, `/library`, **new `/liked`** all `ƒ (Dynamic)`; `ƒ Proxy (Middleware)` prints). **Live browser run
  user-confirmed working** ("verified everything working fine"): like from a card → heart fills instantly
  (optimistic) → `/liked` lists it; unlike removes it; player-bar heart reflects + toggles the active track
  in sync; anon heart click → AuthModal; "Liked Songs" nav entry signed-in-only; playing from `/liked` sets
  the queue to the liked list. The **visibility-gated `liked_songs` INSERT** `with check` now runs on every
  like — the **positive** path (liking a *visible* song) is exercised; the negative path (blocked when a song
  isn't visible) is still not UI-triggerable (needs a 2nd user/private song) but the policy is live.
  **Phase 5 — Feature 11 complete.**
- **12 — New files:** `src/components/VisibilityBadge.tsx` (presentational chip),
  `src/components/library/LibraryUploadButton.tsx` (`'use client'`), `src/components/library/LibraryEmptyState.tsx`
  (`'use client'`). Modified: `SongItem.tsx` (+`showVisibility?` prop), `SongGrid.tsx` (+`showVisibility?` passthrough),
  `app/(site)/library/page.tsx` (header flex row + empty/grid branch). **No schema, no Server Action, no new read, no new
  dep** — `Song` already carried `is_public`; "newly uploaded appears immediately" was already handled by
  `UploadModal`'s `router.refresh()` + `createSong`'s `revalidatePath('/library')` (verify-only, unchanged).
- **12 — Badge is opt-in & Library-only (USER-CHOSEN).** `showVisibility` defaults false and is threaded
  `SongGrid → SongItem`; only `/library` passes it, so Home/Liked/Search cards are byte-for-byte unchanged (no badge
  leak). The chip reads the owner's own `song.is_public` — fine since Library only ever lists the owner's uploads.
- **12 — Badge BOTH states, achromatic (USER-CHOSEN).** Shows `FiGlobe` "Public" / `FiLock` "Private" so "no chip"
  is never ambiguous. Kept achromatic (`bg-surface-2`/`text-muted`), distinguished by icon+label — DESIGN §7/§9 reserve
  accent green for functional highlights, so the badge must not use it. Type = DESIGN §3 Badge role (`text-2xs` 10px,
  `font-semibold`, pill `rounded-full`). Placed **inline under the author** (`mt-2`), keeping the cover overlay (like
  top-right / play bottom-right) clean.
- **12 — Upload entry point = Header + empty state (USER-CHOSEN).** `LibraryUploadButton` (white pill: `Button
  variant="white"` + `FiPlus` "Upload") opens the existing `useUploadModal()`. Rendered top-right by the title **only
  when `songs.length > 0`**; the polished `LibraryEmptyState` carries its own copy of the same button, so the two CTAs
  never stack. `variant="white"` keeps accent green exclusive to playback/active (easily switched to `pill` later).
  Library page (Server Component) stays a server read; the new buttons/empty-state are the only client bits.
- **12 — Verified static + LIVE (user-confirmed 2026-06-12, "verified everything working fine").** `npm run lint`
  clean; `npm run build` green (`/library` `ƒ (Dynamic)`; build still prints `ƒ Proxy (Middleware)`). Live: empty-account
  `/library` → polished empty state + working Upload CTA; upload one public + one private → both appear immediately with
  correct chips; header Upload button shows when songs exist; Home/`/liked`/Search render NO chip. **Phase 5 — Library &
  Likes now fully complete.**
- **13 — New files:** `src/stores/use-playlist-modal.ts` (store with `editing: {id,title}|null` — null=create, set=rename;
  still ephemeral UI state, no Supabase), `src/actions/{create,rename,delete}-playlist.ts` (verbatim `create-song` contract:
  getUser re-check → mutate → log raw + user-safe error → `revalidatePath`), `src/hooks/useUserPlaylists.ts` (React Query
  `['user-playlists']`, browser client, `enabled:!!user` — mirrors `useLikedSongs`), `src/server/get-playlist.ts`
  (`getPlaylistById` → `maybeSingle()`, RLS-scoped, returns null), `src/components/modals/PlaylistModal.tsx` (one modal both
  modes), `src/components/PlaylistList.tsx` (sidebar list), `src/components/playlist/PlaylistHeaderActions.tsx`,
  `src/app/(site)/playlist/[id]/page.tsx`. **Modified:** `ModalProvider` (+`<PlaylistModal/>`), `Sidebar` (+`<PlaylistList/>`),
  `Header` (+signed-in "Create playlist" `MdPlaylistAdd` button). **No schema/migration/dep** — `playlists` table + owner-RLS
  shipped in Feature 06; `Playlist` alias already existed. (`/architect` plan: `~/.claude/plans/abstract-noodling-swan.md`.)
- **13 — Minimal `/playlist/[id]` page now (USER-CHOSEN over page-less).** Singular `/playlist/[id]` per `architecture.md`
  (already in `proxy.ts` `protectedPaths`). Page = `requireUser()` → `getPlaylistById(id)` → `notFound()` if null (RLS returns
  null for non-owner/missing id, no existence leak) → header (eyebrow "Playlist" + title + `PlaylistHeaderActions`) + an empty
  "This playlist has no songs yet." body. **Tracks (add/remove/reorder) are deliberately Feature 14** — 13 stops at the shell.
- **13 — Surface = sidebar list + Header create (USER-CHOSEN "sidebar + mobile reach").** `PlaylistList` renders inside the
  `Sidebar` (signed-in only, hidden for anon): "Playlists" label + "+" create at md+, the playlist **name links only at lg**
  (the md w-24 icon-rail has no room for names — shows just the "+"). Mobile (sidebar hidden <md) gets create reach via the
  Header "Create playlist" button (distinct `MdPlaylistAdd`, next to upload `+`). **A mobile playlist-index page is out of
  scope for 13** — the *list* stays sidebar-only (lg). The list stays fresh via React Query: callers
  `invalidateQueries(['user-playlists'])`; the actions own `revalidatePath` for the server-rendered page.
- **13 — One `PlaylistModal`, create + rename (USER-CHOSEN), title-only (USER-CHOSEN).** `editing` from the store toggles mode;
  an effect `reset({title: editing?.title ?? ''})` keyed on `isOpen`/`editing` prefills (RHF `reset`, not setState → dodges the
  React 19 `set-state-in-effect` rule that bit 04/05/09). onSubmit is split into editing/create branches (not a ternary) so
  `res.data.id` type-narrows cleanly (rename returns `ActionResult<void>`, create `ActionResult<{id}>`). Create → toast +
  invalidate + `router.push('/playlist/'+id)`; rename → toast + invalidate + `router.refresh()` (page is server-read).
  description/cover columns exist but are left unused (deferred).
- **13 — Delete = confirm dialog (USER-CHOSEN over native confirm).** `PlaylistHeaderActions` opens a **local** (`useState`)
  confirm built on the `Modal` shell; Delete button is `Button variant="pill"` overridden to `bg-negative text-black`
  (twMerge keeps the last `bg-*`) so red signals destructive — accent green stays functional-only (DESIGN §7). On success:
  toast → `invalidateQueries(['user-playlists'])` → `router.push('/')`.
- **13 — Verified static + headless; signed-in flow PENDING live user run.** `npm run lint` clean; `npm run build` green
  (`/playlist/[id]` = `ƒ (Dynamic)`; `ƒ Proxy (Middleware)` prints; TS passes). Headless (prod server :3098): anon
  `/playlist/<uuid>` → 307 → `/` (proxy gate covers the new route), `/library` → 307 → `/`, `/` → 200. **Still needs a live
  signed-in run** (Google-OAuth constraint): create via Header → modal → navigate to new `/playlist/[id]` → appears in sidebar
  (lg); rename updates page + sidebar; delete → confirm → back to `/` + gone from sidebar; responsive (list at lg, create
  reachable via Header <md). Cross-user `notFound()` negative path needs a 2nd real user (RLS validated structurally in 06).
