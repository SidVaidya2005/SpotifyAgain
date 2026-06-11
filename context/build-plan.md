# Build Plan

> **Role:** The ordered plan — phases and numbered features to build, in sequence.
> **Read before starting a feature**; build one feature fully before the next.
> **Relates to:** features come from `project-overview.md`; status tracked in `progress-tracker.md`; visuals from `DESIGN-spotify.md`.

## Core Principle

UI-first, then wire the logic, with every step verifiable. Build the visible
shell and screens with mock/static data first so the app is navigable, then
connect Supabase (auth → schema → uploads → playback → collections → search) one
slice at a time. The app is **publicly browsable** — build it so an anonymous
visitor can browse and play public songs from early on, and layer auth-gated
creator features on top. Follow `DESIGN-spotify.md` for every visual decision. A feature
is done only when it can be exercised end-to-end in the running app. Build one
numbered feature fully before starting the next.

---

## Phase 1 — Foundation & Shell

### 01 Project scaffold

Stand up the Next.js 16 + TypeScript + Tailwind v4 project with the approved
dependencies and the folder structure from `architecture.md`.

**Logic:**
- `create-next-app` (App Router, TS, `src/`, `@/` alias); add Tailwind v4 via `@tailwindcss/postcss` and `@import "tailwindcss"` in `globals.css`.
- Install approved deps; create empty `src/` subfolders (`components`, `hooks`, `stores`, `server`, `actions`, `lib`, `providers`, `types`).
- Confirm `npm run dev` serves a blank page and `npm run lint` passes.

### 02 App shell layout

The persistent sidebar + main + bottom player slot, rendered with mock data, styled per `DESIGN-spotify.md`.

**UI:**
- Left `Sidebar` (Home / Search / Library links, logo) — full sidebar at `lg`+, collapsed icon rail at `md`, hidden + bottom nav below `md`.
- Main content area; bottom player bar placeholder fixed full-width to the viewport at every size.
- Responsive song grid that steps 1→2→3→4→5 columns across `sm`/`md`/`lg`/`xl`.

**Logic:**
- Wire the `@theme` design tokens + breakpoints in `globals.css` (see `architecture.md` → Key Patterns) and load Figtree via `next/font/google`.
- Mount shell in the root/app-shell layout so the player slot never unmounts.
- Stub Home with a hard-coded grid of mock songs, visible without any auth.
- Verify the shell responsively at ~375px (phone), 768px (iPad portrait), 1024px (iPad landscape), and 1440px (desktop): sidebar is full at `lg`+, a collapsed rail at `md`, and a bottom nav below `md`; grid column counts correct; player bar fixed full-width.

### 03 Supabase clients & middleware

Wire Supabase into the app with no UI behavior change yet.

**Logic:**
- Add `src/lib/supabase/{client,server,middleware}.ts` and root `middleware.ts` per `architecture.md` patterns (middleware refreshes the session; gates only `/library`, `/liked`, `/playlist`).
- Add `.env.local` keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`).
- Configure `next.config.ts` `images.remotePatterns` for the Supabase Storage host.
- Verify a Server Component can construct the server client without error, signed in or anonymous.

---

## Phase 2 — Authentication

### 04 Google sign-in

Google OAuth login and the callback exchange.

**UI:**
- `AuthModal` (Radix Dialog) with a "Continue with Google" button, driven by `use-auth-modal` store; opened when an anonymous user attempts a protected action.

**Logic:**
- `signInWithOAuth({ provider: 'google', redirectTo: '<site>/auth/callback?next=<current-path>' })`.
- `src/app/auth/callback/route.ts` exchanges the code for a session and redirects to the validated same-origin `next` path (default `/`).
- `UserProvider`/`useUser` exposes the current user client-side.

### 05 Action gating, profiles & sign-out

Gate creator actions and personal pages without blocking public browsing.

**Logic:**
- Middleware redirects unauthenticated users away from `/library`, `/liked`, `/playlist/*` only; Home and Search stay public.
- Personal-page Server Components redirect to `/` when there is no user.
- `profiles` table + RLS + a `handle_new_user` trigger on `auth.users` that inserts the profile row (full_name/avatar_url from Google metadata) automatically on first sign-in — no client write.
- Sidebar shows avatar + a working sign-out (`supabase.auth.signOut()`), then redirect home.

---

## Phase 3 — Songs & Upload

### 06 Database schema & storage

The catalog schema, RLS, and Storage buckets.

**Logic:**
- Migration creating `profiles`, `songs` (incl. `is_public`), `playlists`, `playlist_songs`, `liked_songs` with the columns and RLS from `architecture.md`, plus the `handle_new_user` trigger.
- `songs` SELECT policy: public rows to everyone (incl. anon) plus the owner's own rows; write policies owner-only.
- `liked_songs` and `playlist_songs` INSERT policies additionally require the referenced `song_id` to be visible to the user (`is_public OR own`), so a private song can't be referenced by guessing its id.
- Create `songs` + `images` Storage buckets with public-read + owner-write policies.
- Generate `src/types/database.types.ts` and add domain aliases in `src/types/index.ts`.

### 07 Upload song flow

Authenticated upload of an MP3 + cover + metadata + visibility.

**UI:**
- `UploadModal` with `react-hook-form`: title, author, audio file, image file, and a **public/private** toggle (defaults to public); loading + disabled states.

**Logic:**
- Client uploads both files to Storage under `<user_id>/<uuid>.<ext>`, then calls the `createSong` Server Action to insert the row with `is_public` (see `library-docs.md`); on a later failure the client deletes the already-uploaded object(s).
- Validate file types against `ACCEPTED_*` constants; `toast` success/failure; `reset()` + close on success; `router.refresh()`.

### 08 Home & library wired to real songs

Replace mock data with real catalog reads.

**UI:**
- Home grid of recently uploaded **public** songs (`SongItem`/`MediaItem`), visible to anyone; Library page lists the current user's uploads (public + private).

**Logic:**
- `src/server/get-songs.ts` (RLS-scoped) and `get-songs-by-user.ts` reads in the respective Server Components.

---

## Phase 4 — Playback

### 09 Persistent player

The bottom player playing real uploaded audio, for anyone.

**UI:**
- `PlayerBar` with cover/title/author, play/pause, seek slider, volume slider, per `DESIGN-spotify.md`.

**Logic:**
- `usePlayer` store holds `activeId` + queue `ids`; clicking a song sets both via `useOnPlay`.
- `useLoadSongUrl` resolves the Storage public URL; `use-sound` plays it; cleanup unloads the Howl.
- Works for anonymous visitors on public songs.

### 10 Queue, next & previous

Sequential playback across the launched list.

**Logic:**
- `ids` is set to the list the song was played from; next/previous walk the queue and wrap.
- `onend` auto-advances to the next track.

---

## Phase 5 — Library & Likes

### 11 Like / unlike & Liked Songs

Toggle likes and a dedicated liked view (signed in).

**UI:**
- `LikeButton` (filled/outline heart) on song rows — prompts sign-in for anonymous users; `/liked` page lists liked songs.

**Logic:**
- `toggleLike` Server Action (insert/delete in `liked_songs`); React Query invalidates `['liked-songs']`.
- `/liked` reads via `get-liked-songs.ts`; playing from it sets the queue to liked songs.

### 12 Library polish

Round out the user's library view.

**UI:**
- Library shows the user's uploaded songs (with a public/private indicator) and an "upload" entry point; empty state when none.

**Logic:**
- Reuse `get-songs-by-user.ts`; ensure newly uploaded songs appear immediately.

---

## Phase 6 — Playlists

### 13 Create, rename & delete playlists

Playlist lifecycle (signed in).

**UI:**
- `PlaylistModal` to create/rename; sidebar lists the user's playlists; delete control on the playlist page.

**Logic:**
- `create-playlist` / `rename-playlist` / `delete-playlist` Server Actions against `playlists` (RLS scoped to owner); revalidate sidebar + page.

### 14 Playlist tracks & detail page

Add, remove, reorder tracks; the playlist detail view.

**UI:**
- `/playlist/[id]` shows ordered tracks with add/remove and reorder controls (owner only).

**Logic:**
- `add-song-to-playlist` / `remove-song-from-playlist` / `reorder-playlist` Server Actions on `playlist_songs` (with `position`); enforce unique `(playlist_id, song_id)`; playing sets the queue to the playlist order.

---

## Phase 7 — Search

### 15 Search page

Find public songs by title and author (open to everyone).

**UI:**
- `/search` with a search input and a results list of playable songs; empty/no-results states.

**Logic:**
- `useDebounce` on the query → `searchParams` → `search-songs.ts` (`searchSongs` — **sanitize the query** before interpolating into `.or(title.ilike, author.ilike)`; RLS-scoped to public + own) in the Server Component; results play and can be added to playlists when signed in.

---

## Phase 8 — Deployment

### 16 Deploy to Render

Ship the app live for the portfolio audience.

**Logic:**
- Configure a Render Node Web Service: build `npm install && npm run build`, start `npm run start`; app binds to `PORT`.
- Set production env vars in Render (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` = Render URL).
- Add the Render URL to Supabase Auth Site/Redirect URLs and confirm Google OAuth works in production.
- Seed/upload a few **public** demo songs so a logged-out visitor immediately sees and can play music.
- Verify the deployed URL: anonymous browse + play, sign-in, upload, like, playlist all work end-to-end, and the UI renders correctly on phone, iPad (portrait + landscape), and desktop widths. Optionally commit a `render.yaml` blueprint.

---

## Feature Count

| Phase | Features |
| ----- | -------- |
| Phase 1 — Foundation & Shell | 3 |
| Phase 2 — Authentication | 2 |
| Phase 3 — Songs & Upload | 3 |
| Phase 4 — Playback | 2 |
| Phase 5 — Library & Likes | 2 |
| Phase 6 — Playlists | 2 |
| Phase 7 — Search | 1 |
| Phase 8 — Deployment | 1 |
| **Total** | **16** |
