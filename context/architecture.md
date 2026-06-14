# Architecture

> **Role:** How the system is built — stack, structure, boundaries, data, and the invariants that must never be violated.
> **Read after** `project-overview.md`, before writing any code.
> **Relates to:** the stack here drives `code-standards.md` and `library-docs.md`; UI/visual decisions live in `DESIGN-spotify.md`.

## Stack

| Layer | Tool | Purpose |
| ----- | ---- | ------- |
| Language | TypeScript (strict) | All app and server code |
| Framework | Next.js 16 (App Router) + React 19 | Routing, Server Components, Server Actions, Route Handlers |
| Styling | Tailwind CSS v4 | Utility-first styling via `@import "tailwindcss"` |
| Fonts | Figtree via `next/font/google` | Free geometric sans closest to Spotify's Circular; see `DESIGN-spotify.md` |
| UI primitives | Radix UI (`react-dialog`, `react-slider`, `react-tooltip`) | Accessible modal, slider + tooltip primitives |
| Icons | `react-icons` | Iconography |
| Toasts | `sonner` | User-facing success/error notifications |
| Database | Supabase Postgres | Persistent relational store with Row Level Security |
| Auth | Supabase Auth (Google OAuth) | Sign-in, sessions, `auth.users` |
| Storage | Supabase Storage | Audio files (`songs` bucket) + cover images (`images` bucket) |
| DB/Auth/Storage SDK | `@supabase/supabase-js` + `@supabase/ssr` | Browser + server clients with cookie-based sessions |
| Server state | `@tanstack/react-query` v5 | Client-side reactive reads/mutations (liked state, playlist edits) |
| Client state | `zustand` v5 | Ephemeral player + modal/UI state |
| Audio | `use-sound` (Howler) | Playback engine in the player bar |
| Forms | `react-hook-form` | Upload + playlist forms |
| Drag & drop | `@dnd-kit/*` (core, sortable, modifiers, utilities) | Reorder playlist tracks (pointer + touch + keyboard) |
| Class utils | `clsx` + `tailwind-merge` | Conditional/merged className composition |
| IDs | `uuid` | Unique Storage object paths |
| Hosting | Render (Node Web Service) | Runs `next build` / `next start` on the platform `PORT` |

---

## Folder Structure

> **Status — built and live.** The v1 app (16/16) plus the Phase 9–11 enhancements
> (post-v1 enhancements, v2 UI refinements, and sectioned Home) are built; the tree below
> reflects what is actually on disk (branch `main`). The live deploy tracks `main`;
> build/branch state is in `progress-tracker.md`.

```
SpotifyAgain/
├── CLAUDE.md                      → agent entry point, redirects here
├── README.md                      → short project blurb (2-line stub; full write-up still TODO)
├── context/                       → this documentation set (source of truth)
│   ├── project-overview.md · architecture.md · code-standards.md
│   ├── DESIGN-spotify.md          → UI/visual source of truth (incl. §10 Modernization v2)
│   ├── library-docs.md · build-plan.md · progress-tracker.md
│   └── build-journal.md           → verbatim per-feature history (not read at session start)
├── memory.md                      → latest session handoff (root, /remember)
├── next.config.ts                 → images.remotePatterns (Supabase Storage host + Google avatar host); turbopack root
├── tsconfig.json                  → "@/*" path alias → src/*
├── render.yaml                    → Render blueprint (build/start/env)
├── .nvmrc                         → Node 22 (pins Render's Node)
├── .env.example                   → documents the NEXT_PUBLIC_* keys (.env.local is git-ignored)
├── eslint.config.mjs · postcss.config.mjs
├── supabase/
│   └── migrations/                → SQL schema + RLS + storage buckets (source of truth for DB)
│       ├── 20260611202834_profiles_and_handle_new_user.sql
│       └── 20260612015610_catalog_schema_and_storage.sql
├── scripts/
│   └── seed-songs.mjs             → local demo-catalog seeder (npm run seed:songs; service-role key, gitignored Songs/)
├── public/                        → static assets
└── src/
    ├── proxy.ts                   → Next 16 request entry (was root middleware.ts): refreshes session, guards personal routes
    ├── app/
    │   ├── layout.tsx             → root layout: providers + app shell (header, sidebar, player, top-gradient)
    │   ├── globals.css            → @import "tailwindcss" + @theme tokens + @utility top-fade
    │   ├── (site)/
    │   │   ├── page.tsx           → Home (public)
    │   │   ├── search/page.tsx    → Search + "Recently added" default (public)
    │   │   ├── liked/page.tsx     → Liked Songs (auth required)
    │   │   ├── library/page.tsx   → user's uploaded songs (auth required)
    │   │   └── playlist/[id]/page.tsx → playlist detail (owner only)
    │   └── auth/callback/route.ts → OAuth code exchange
    ├── components/
    │   ├── player/                → PlayerBar, PlayerContent (shuffle + more-like-this), SeekSlider, VolumeSlider
    │   ├── modals/                → UploadModal, AuthModal, PlaylistModal, AddToPlaylistModal
    │   ├── library/               → LibraryEmptyState, LibraryUploadButton
    │   ├── playlist/              → PlaylistHeaderActions, PlaylistTrackList, PlaylistTrackRow
    │   ├── Sidebar.tsx, BottomNav.tsx, Header.tsx, HeaderSearch.tsx
    │   ├── SongGrid.tsx, SongItem.tsx (hover-lift), LikeButton.tsx, AddToPlaylistButton.tsx
    │   └── Button.tsx, Modal.tsx, Tooltip.tsx, UserMenu.tsx, VisibilityBadge.tsx, PlaylistList.tsx, PortfolioLinks.tsx
    ├── providers/                 → ReactQueryProvider, ModalProvider, UserProvider, ToasterProvider, TooltipProvider
    ├── hooks/                     → useUser, useLoadSongUrl, useLoadImage, useDebounce, useOnPlay,
    │                                useGetSongById, useLikedSongs, useToggleLike, useUserPlaylists,
    │                                useSearchSongs, useMoreLikeThis
    ├── stores/                    → use-player, use-upload-modal, use-auth-modal, use-playlist-modal, use-add-to-playlist-modal
    ├── server/                    → get-songs, get-songs-by-user, get-liked-songs, get-playlist,
    │                                get-playlist-songs, search-songs, require-user, optional-user (read-only; Server Component use)
    ├── actions/                   → create-song, toggle-like, create-playlist, rename-playlist, delete-playlist,
    │                                add-song-to-playlist, remove-song-from-playlist, reorder-playlist ("use server")
    ├── lib/
    │   ├── constants.ts           → STORAGE_BUCKETS, ACCEPTED_* types, PORTFOLIO_LINKS
    │   ├── search.ts              → sanitizeSearchQuery (shared by server read + client hook)
    │   ├── artists.ts             → groupSongsByAuthor (pure; sectioned-Home author shelves)
    │   ├── utils.ts               → cn() (clsx + tailwind-merge)
    │   └── supabase/
    │       ├── client.ts          → createClient() for browser/client components
    │       ├── server.ts          → createClient() for Server Components / Actions / Route Handlers
    │       └── middleware.ts      → updateSession() helper used by src/proxy.ts
    └── types/
        ├── database.types.ts      → generated Supabase types
        └── index.ts               → domain types (Song, Playlist, ActionResult, …)
```

---

## System Boundaries

| Folder | Owns |
| ------ | ---- |
| `src/app/**/page.tsx` | Server Components: route composition + initial data reads via `src/server/*`. Personal pages redirect to `/` when unauthenticated. No client hooks, no direct mutations. |
| `src/app/**/route.ts` | Route Handlers (only `auth/callback`). No UI. |
| `src/components/` | Presentational + client components, styled per `DESIGN-spotify.md`. No direct DB queries in Server Component children; client components use hooks/actions. |
| `src/server/` | Server-only **read** functions using the server Supabase client. Never imported by client components. No mutations. |
| `src/actions/` | `"use server"` **mutations**. The only place writes happen server-side. Always re-check `auth.getUser()`. |
| `src/stores/` | Zustand stores for ephemeral UI/player state only. Never persists domain data; never calls Supabase. |
| `src/hooks/` | Client-side React hooks (data loading via client Supabase, debouncing, play handlers). |
| `src/lib/supabase/` | The only place Supabase clients are constructed. Everything else imports from here. |
| `src/types/` | Type definitions only. No runtime code. |
| `supabase/migrations/` | Canonical DB schema + RLS. The database is never changed by hand outside migrations. |

---

## Data Flow

### Initial page read (Server Component)

```
Browser request (signed in OR anonymous)
  → proxy.ts (refresh session; redirect only personal routes if no user)
  → app/(site)/<page>.tsx (Server Component)
  → src/server/<fetcher>() with server Supabase client (RLS applies)
  → render HTML with data → client components hydrate
```

### Mutation (like, create playlist, reorder)

```
Client component (button/form) — prompts sign-in if anonymous
  → Server Action in src/actions/  (or React Query mutation)
  → server Supabase client, re-check auth.getUser()
  → write to Postgres (RLS enforces ownership)
  → revalidatePath() / React Query invalidate → UI updates
```

### Upload (client Storage upload → Server Action DB insert)

```
UploadModal (client) with react-hook-form, uid = uuidv4()
  → client Supabase: storage.from('songs').upload(`${userId}/${uid}.mp3`, mp3)
  → client Supabase: storage.from('images').upload(`${userId}/${uid}.${ext}`, cover)
  → createSong Server Action { title, author, songPath, imagePath, isPublic }
        ↳ re-checks getUser(), inserts the songs row (RLS owner-write), revalidates
  → success: toast, close modal
  → failure after an upload: client deletes the orphaned Storage object(s), then toasts the error
```

Storage uploads are the **one client-side write** — direct-to-Storage is the
supported Supabase pattern and avoids routing multi-MB audio through a Server
Action — but the resulting **DB row insert still goes through a Server Action**
(`createSong`), keeping every database write server-side and auth-checked.

### Playback

```
Click song → useOnPlay sets usePlayer { activeId, ids[] (the queue) }
  → PlayerBar reads activeId → useLoadSongUrl() resolves Storage public URL
  → use-sound plays → seek/volume/next/prev mutate usePlayer + Howl
```

---

## Data Model

All tables live in the `public` schema with Row Level Security **enabled**.
`user_id` columns reference `auth.users(id)`.

### `profiles`

| Column | Type | Notes |
| ------ | ---- | ----- |
| id | uuid | PK, references `auth.users(id)` on delete cascade |
| full_name | text | from Google profile |
| avatar_url | text | from Google profile |
| updated_at | timestamptz | default `now()` |

RLS: a user may select/update only their own row (`id = auth.uid()`). The row is
created automatically by a Postgres trigger (`handle_new_user`) on `auth.users`
insert, copying `full_name`/`avatar_url` from the Google identity — so a profile
always exists after first sign-in with no client write.

### `songs`

| Column | Type | Notes |
| ------ | ---- | ----- |
| id | uuid | PK, default `gen_random_uuid()` |
| user_id | uuid | uploader, references `auth.users(id)` |
| title | text | not null |
| author | text | not null |
| song_path | text | object path in `songs` bucket |
| image_path | text | object path in `images` bucket |
| is_public | boolean | not null, default `true` — controls cross-user visibility |
| created_at | timestamptz | default `now()` |

RLS: **SELECT** allowed for anyone (including anonymous) where `is_public = true`,
plus the owner's own rows (`auth.uid() = user_id`); INSERT/UPDATE/DELETE only
where `user_id = auth.uid()`.

### `playlists`

| Column | Type | Notes |
| ------ | ---- | ----- |
| id | uuid | PK, default `gen_random_uuid()` |
| user_id | uuid | owner, references `auth.users(id)` |
| title | text | not null |
| description | text | nullable |
| image_path | text | nullable cover |
| created_at | timestamptz | default `now()` |

RLS: all operations only where `user_id = auth.uid()` (private playlists).

### `playlist_songs`

| Column | Type | Notes |
| ------ | ---- | ----- |
| id | uuid | PK, default `gen_random_uuid()` |
| playlist_id | uuid | references `playlists(id)` on delete cascade |
| song_id | uuid | references `songs(id)` on delete cascade |
| position | int | track order within the playlist |
| added_at | timestamptz | default `now()` |

RLS: a row is accessible only if its `playlist_id` belongs to a playlist owned by
`auth.uid()`. **INSERT additionally requires the referenced `song_id` to be visible
to the user** (`is_public = true OR songs.user_id = auth.uid()`), so a user cannot
add a private song they can't see by guessing its id. Unique `(playlist_id, song_id)`.

### `liked_songs`

| Column | Type | Notes |
| ------ | ---- | ----- |
| user_id | uuid | references `auth.users(id)`, part of composite PK |
| song_id | uuid | references `songs(id)` on delete cascade, part of composite PK |
| created_at | timestamptz | default `now()` |

RLS: all operations only where `user_id = auth.uid()`. **INSERT additionally
requires the referenced `song_id` to be visible to the user** (`is_public = true OR
songs.user_id = auth.uid()`) — you can only like songs you can actually see.

---

## File / Object Storage

| Bucket / Location | Path | Contents | Access |
| ----------------- | ---- | -------- | ------ |
| `songs` | `<user_id>/<uuid>.mp3` | Uploaded audio files | Public read; insert/update/delete only by owner via Storage RLS |
| `images` | `<user_id>/<uuid>.<ext>` | Song + playlist cover art | Public read; insert/update/delete only by owner via Storage RLS |

Audio and image URLs are resolved with `storage.from(bucket).getPublicUrl(path)`.
Object paths are always prefixed with the owner's `user_id`.

**Visibility note — obfuscation, not true privacy.** The buckets are public-read,
so marking a song *private* only hides it from the catalog: RLS on `songs` stops
other users from listing it or discovering its object path through the app. It does
**not** protect the file itself — anyone who obtains the public URL (shared, cached,
or logged while the song was public) can still stream it. Treat private as
"unlisted," not "access-controlled." True private streaming (a private bucket with
short-lived signed URLs) is out of scope (see `project-overview.md`).

---

## Authentication

- Provider: Supabase Auth.
- Methods: **Google OAuth only** — no email/password, no other providers.
- Flow: client calls `signInWithOAuth({ provider: 'google', options: { redirectTo: '<site>/auth/callback?next=<current-path>' } })` → Google → `/auth/callback` exchanges the code for a session via `exchangeCodeForSession`, then redirects to the validated same-origin `next` path.
- **Public (no session):** Home, Search, playback of public songs, the login surface, and `/auth/callback`.
- **Protected (session required):** creator actions (upload, like, create/edit playlist) and personal pages (`/liked`, `/library`, `/playlist/[id]`).
- Session check lives in `src/proxy.ts` (Next 16's renamed `middleware.ts`; it goes in `src/` because the app does), which calls `updateSession` and **refreshes the session on every request but only redirects personal routes** when there is no user. Auth is additionally enforced (a) in every Server Action via `supabase.auth.getUser()` and (b) in personal-page Server Components, which redirect to `/` when there is no user.
- Post-login destination: the `next` path captured when sign-in was triggered (must start with `/`, else `/`). The `profiles` row is guaranteed by the `handle_new_user` trigger, so the callback only handles session exchange + redirect — it never writes the profile.

---

## Deployment (Render)

- Hosted on Render as a **Node Web Service** (not a static site — the app uses Server Components, Actions, and a Route Handler).
- **Build command:** `npm install && npm run build`. **Start command:** `npm run start`. Next.js binds to `process.env.PORT`, which Render injects.
- Environment variables are set in the Render dashboard (never committed): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` (= the Render URL), and `SUPABASE_SERVICE_ROLE_KEY` only if a server seed/admin task needs it.
- In **Supabase → Auth**, add the Render URL as the Site URL and to the allowed Redirect URLs. In **Google Cloud OAuth**, the authorized redirect is the Supabase callback URL; the app's `redirectTo` is `${NEXT_PUBLIC_SITE_URL}/auth/callback`.
- `next.config.ts` `images.remotePatterns` must include the Supabase Storage host so cover art renders via `<Image>` (it also whitelists `lh3.googleusercontent.com` for Google profile avatars in the account menu).
- An optional `render.yaml` blueprint at the repo root captures the build/start commands and env var names for reproducible deploys.

---

## Key Patterns

### Browser Supabase client

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

### Server Supabase client

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component — safe to ignore; middleware refreshes the session.
          }
        },
      },
    },
  )
}
```

### Session refresh middleware

This `updateSession` helper is invoked by `src/proxy.ts` (Next 16 renamed the
`middleware.ts` entry/export to `proxy.ts`/`proxy`; it lives in `src/` because the
app does, and the helper keeps its name). The entry is just:

```typescript
// src/proxy.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

```typescript
// src/lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Do not run code between createServerClient and getUser — it can break sessions.
  const { data: { user } } = await supabase.auth.getUser()

  // Browsing and playback are public; only personal pages require a session.
  const protectedPaths = ['/library', '/liked', '/playlist']
  const needsAuth = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p))
  if (!user && needsAuth) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}
```

### Server-side data fetcher (read)

```typescript
// src/server/get-songs.ts
import { createClient } from '@/lib/supabase/server'
import type { Song } from '@/types'

export async function getSongs(): Promise<Song[]> {
  const supabase = await createClient()
  // RLS returns public songs to everyone, plus the viewer's own private songs.
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getSongs]', error.message)
    return []
  }
  return data ?? []
}
```

### Player store

```typescript
// src/stores/use-player.ts
import { create } from 'zustand'

// Pure module-scope helpers — no Supabase, no React.
function shuffle(arr: string[]): string[] {            // Fisher–Yates on a copy
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// Insert newIds (de-duped) right after activeId; append if activeId is absent.
function insertAfterActive(arr: string[], activeId: string | undefined, newIds: string[]): string[] {
  const additions = newIds.filter((id) => !arr.includes(id))
  if (additions.length === 0) return arr
  const i = activeId ? arr.indexOf(activeId) : -1
  if (i === -1) return [...arr, ...additions]
  return [...arr.slice(0, i + 1), ...additions, ...arr.slice(i + 1)]
}

// Ephemeral playback state only — never holds Song objects, never calls Supabase.
interface PlayerState {
  ids: string[]            // active queue, in play order (shuffled when isShuffled)
  originalOrder: string[]  // unshuffled launch order, restored when shuffle turns off
  activeId?: string
  isShuffled: boolean      // persistent global toggle
  setId: (id: string) => void
  setIds: (ids: string[]) => void
  toggleShuffle: () => void
  addToQueueAfterActive: (newIds: string[]) => void   // "more like this"
  reset: () => void
}

export const usePlayer = create<PlayerState>((set) => ({
  ids: [],
  originalOrder: [],
  activeId: undefined,
  isShuffled: false,
  setId: (id) => set({ activeId: id }),
  // Launch a list: remember its natural order; reshuffle now if shuffle is on, so a
  // newly-played list respects the current (persistent) shuffle state.
  setIds: (ids) =>
    set((state) => ({ originalOrder: ids, ids: state.isShuffled ? shuffle(ids) : ids })),
  // On: snapshot order then shuffle. Off: restore it. activeId untouched → no reload.
  toggleShuffle: () =>
    set((state) =>
      state.isShuffled
        ? { isShuffled: false, ids: state.originalOrder }
        : { isShuffled: true, originalOrder: state.ids, ids: shuffle(state.ids) },
    ),
  // Queue songs right after the current track — in both orders, so a later un-shuffle stays consistent.
  addToQueueAfterActive: (newIds) =>
    set((state) => ({
      ids: insertAfterActive(state.ids, state.activeId, newIds),
      originalOrder: insertAfterActive(state.originalOrder, state.activeId, newIds),
    })),
  reset: () => set({ ids: [], originalOrder: [], activeId: undefined, isShuffled: false }),
}))
```

### Design tokens (Tailwind v4 `@theme`)

`DESIGN-spotify.md` is encoded once as Tailwind v4 design tokens in `globals.css`.
Every component then styles with the generated semantic utilities (`bg-surface`,
`text-muted`, `rounded-pill`, `shadow-dialog`, `xs:`/`md:`/`lg:` variants) — never
raw hex/px from the design file. Component-level patterns (button variants, type
roles, the inset input border) live as `@layer components` classes or React
primitives; see `code-standards.md` → Visual Design.

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* Fonts */
  --font-sans: "Figtree", "Helvetica Neue", Helvetica, Arial, sans-serif;

  /* Surfaces — near-black, depth via shade */
  --color-base: #121212;        /* page background        */
  --color-surface: #181818;     /* cards, sidebar, player  */
  --color-surface-2: #1f1f1f;   /* buttons, inputs         */
  --color-card: #252525;        /* elevated card           */
  --color-card-2: #272727;      /* alternate card          */

  /* Brand accent — functional only (play / active / CTA) */
  --color-accent: #1ed760;
  --color-accent-border: #1db954;

  /* Text */
  --color-text: #ffffff;        /* primary                 */
  --color-muted: #b3b3b3;       /* secondary / inactive nav / dividers */
  --color-subtle: #cbcbcb;      /* brighter secondary      */
  --color-bright: #fdfdfd;      /* max emphasis            */

  /* Borders */
  --color-border: #4d4d4d;
  --color-border-light: #7c7c7c;

  /* Semantic */
  --color-negative: #f3727f;
  --color-warning: #ffa42b;
  --color-announcement: #539df5;

  /* Radii — pill + circle geometry (rounded-full covers 9999px & 50%) */
  --radius-pill: 500px;

  /* Shadows — heavy, for elevation on dark */
  --shadow-card: 0 8px 8px rgb(0 0 0 / 0.3);
  --shadow-dialog: 0 8px 24px rgb(0 0 0 / 0.5);
  --shadow-inset-border: 0 1px 0 #121212, inset 0 0 0 1px #7c7c7c;

  /* Green hover/focus glow — sanctioned functional feedback (DESIGN §7 exception, feature 25) */
  --shadow-glow: 0 0 16px 0 rgb(30 215 96 / 0.35);                                  /* halo only (header buttons) */
  --shadow-card-glow: 0 8px 8px rgb(0 0 0 / 0.3), 0 0 16px 0 rgb(30 215 96 / 0.28); /* card lift + halo */

  /* Breakpoints — overrides Tailwind defaults to match the device targets */
  --breakpoint-xs: 425px;   /* large phones                              */
  --breakpoint-sm: 576px;   /* small tablets · 2-col grid                 */
  --breakpoint-md: 768px;   /* iPad portrait · 3-col grid                 */
  --breakpoint-lg: 1024px;  /* iPad landscape / desktop · sidebar · 4-col */
  --breakpoint-xl: 1280px;  /* large desktop · 5-col                      */

  /* Extra type size (24/20/18/16/14/12px already map to Tailwind defaults) */
  --text-2xs: 0.625rem;     /* 10px — micro */
}
```

---

## Invariants

- Supabase clients are constructed **only** in `src/lib/supabase/` — never call `createBrowserClient`/`createServerClient` anywhere else.
- Server Components and `src/server/*` use the **server** client; client components and `src/hooks/*` use the **browser** client. Never cross them.
- RLS is **enabled on every table**; `songs` SELECT is readable by anyone when `is_public = true` (plus the owner's own rows) — every other table's policies scope strictly by `auth.uid()`. No table is ever exposed without a policy.
- A song is exposed to other users only when `is_public = true`; a private song's row is never returned to anyone but its owner.
- Browsing and playback of public songs require **no session**; only writes (upload/like/playlist) and personal pages (`/liked`, `/library`, `/playlist`) require auth — enforced in `src/proxy.ts`, in Server Actions via `getUser()`, and in personal-page Server Components.
- Every Server Action re-verifies the user with `supabase.auth.getUser()` before any write — never trust a client-passed user id.
- All **database** writes go through `src/actions/` Server Actions (re-checking `getUser()`); Server Components never mutate. The sole client-side write is uploading a file to Supabase Storage; the corresponding DB row is still inserted via a Server Action.
- A user may reference (like / add to a playlist) only songs visible to them (`is_public = true` or their own); RLS enforces this on INSERT.
- Storage object paths are always `"<user_id>/<uuid>.<ext>"` (audio `.mp3`, images keep their real extension); never write to another user's prefix. If a later upload/insert step fails, the client deletes the objects it already wrote so no orphans remain.
- The player bar is mounted once in the root/app-shell layout and never unmounts on navigation — playback state lives in the `usePlayer` Zustand store, not in route components.
- Zustand stores hold ephemeral UI/player state only; they never read or write Supabase.
- The DB schema changes only through files in `supabase/migrations/` — never via ad-hoc SQL or the dashboard alone.
- Secrets (service-role key) never reach client code; only `NEXT_PUBLIC_*` env vars may be referenced in components.
- Use the `@/` path alias for all `src/` imports; no `../../..` traversal across top-level folders.
- All UI/visual decisions follow `context/DESIGN-spotify.md`; never invent colors, spacing, or component styling not specified there.
- Styling uses the `@theme` design tokens via semantic utilities (`bg-surface`, `text-accent`, `rounded-pill`, `shadow-dialog`); never hardcode the design file's raw hex/px inline.
- The layout is mobile-first and must render correctly at phone (≤640px), iPad portrait (768px) and landscape (1024px), and desktop (≥1280px): the sidebar collapses to a bottom nav below `lg`, the song grid steps 1→2→3→4→5 columns across `sm`/`md`/`lg`/`xl`, and the player bar stays fixed full-width at every size.
