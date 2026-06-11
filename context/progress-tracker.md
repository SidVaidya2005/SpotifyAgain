# Progress Tracker

> **Role:** Live build status — what's done, in progress, and next.
> **Read at the start of every session**; **update after every completed feature.**
> **Relates to:** mirrors `build-plan.md` exactly.

Update this file after every completed feature. Any AI agent reading this should
immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 2 — Authentication (in progress)
**Last completed:** 04 Google sign-in (built + verified end-to-end; live OAuth round-trip working)
**Next:** 05 Action gating, profiles & sign-out

---

## Progress

### Phase 1 — Foundation & Shell
- [x] 01 Project scaffold
- [x] 02 App shell layout
- [x] 03 Supabase clients & middleware

### Phase 2 — Authentication
- [x] 04 Google sign-in
- [ ] 05 Action gating, profiles & sign-out

### Phase 3 — Songs & Upload
- [ ] 06 Database schema & storage
- [ ] 07 Upload song flow
- [ ] 08 Home & library wired to real songs

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
