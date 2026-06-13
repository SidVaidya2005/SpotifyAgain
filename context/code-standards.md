# Code Standards

> **Role:** The rules every change must follow — language, framework, naming, error handling, dependencies.
> **Read before writing code**; obey on every change.
> **Relates to:** derives from the stack in `architecture.md`.

Implementation rules and conventions for the entire project. The AI agent must
follow these in every session without exception. These rules prevent pattern
drift across sessions.

---

## Engineering Mindset

The AI agent on this project operates as a senior engineer. This means:

- **Think before implementing** — understand what is being built and why before writing a single line.
- **Read context files first** — never assume, always verify against `architecture.md` and `project-overview.md`.
- **Scope is sacred** — only build what the current feature requires; never go beyond scope even if it seems helpful.
- **Every feature must be testable** — if it cannot be verified immediately after implementation, it is incomplete.
- **Clean over clever** — simple readable code a junior can follow beats clever abstractions.
- **One thing at a time** — complete one feature fully before touching the next.
- **Failures are expected** — handle errors deliberately; never let one failure crash everything.

---

## TypeScript

- `strict` mode is on. No implicit `any`; do not silence the compiler with `any` or `// @ts-ignore` — fix the type.
- Type all Supabase results against `src/types/database.types.ts`; domain aliases (`Song`, `Playlist`) live in `src/types/index.ts`.
- Prefer `type` aliases for shapes and unions; use `interface` only for store/props contracts that may extend.
- Use `async/await`; never leave a floating promise. Handle the rejected path explicitly.
- Prefer immutable updates (`map`/`filter`/spread); never mutate props, store state, or arrays in place.
- No non-null assertions (`!`) except on the documented `process.env.NEXT_PUBLIC_*` reads in `src/lib/supabase/`.
- Export named symbols; avoid default exports except for Next.js `page.tsx`/`layout.tsx`/`route.ts` where the framework requires them.

---

## Next.js 16 (App Router) Conventions

- **Server Components by default.** Add `'use client'` only when a component needs state, effects, browser APIs, or event handlers.
- Initial data reads happen in Server Components via `src/server/*`; never fetch initial page data in a `useEffect`.
- `cookies()`, `headers()`, and route `params`/`searchParams` are **async in Next 16** — always `await` them.
- All mutations are Server Actions in `src/actions/` (`'use server'`) or explicit React Query mutations; after a server write, call `revalidatePath()` or invalidate the relevant React Query key.
- Business logic and DB access never live in components — they live in `src/server/` (reads) and `src/actions/` (writes).
- **Browsing and playback are public — do not gate the whole app.** Enforce auth only in (a) Server Actions (return `{ error }` when `getUser()` is null) and (b) personal-page Server Components (`/liked`, `/library`, `/playlist/[id]`), which redirect to `/` when there is no user. Home and Search stay open to anonymous visitors.
- Use the `<Image>` component for cover art; configure the Supabase Storage host in `next.config.ts` `images.remotePatterns`.
- Never read secret env vars in a component; only `NEXT_PUBLIC_*` may appear in client code.

---

## Visual Design

- All visual/UI decisions — color, spacing, typography, component look, icon set, loading/empty/error/hover states — come from `context/DESIGN-spotify.md`. Read the relevant section before styling.
- Tailwind/Radix are the *mechanics*; `DESIGN-spotify.md` is the *spec*. If a value isn't specified there, leave a `TODO:` and ask — never invent visual design.

### Design tokens, not raw values

- The design file is encoded as Tailwind v4 `@theme` tokens in `globals.css` (see `architecture.md` → Key Patterns). Style with the generated semantic utilities: `bg-base`/`bg-surface`/`bg-surface-2`, `text-text`/`text-muted`/`text-subtle`, `text-accent`/`bg-accent`, `rounded-pill`, `rounded-full` (circles & 9999px), `shadow-card`/`shadow-dialog`.
- Never paste a raw hex (`#1ed760`) or a one-off px into a component when a token exists. If something genuinely missing, add the token to `@theme` first, then use it.
- Repeated complex patterns become primitives, not copy-pasted utilities:
  - **Buttons** → a `<Button variant="pill" | "outline" | "play">` component matching `DESIGN-spotify.md` §4.
  - **Type roles** → small text components or `@layer components` classes bundling size + weight + tracking + uppercase (e.g. the uppercase, ~0.1em-tracking button label).
  - **Inset input border** → the `shadow-inset-border` token; never inline the two-layer shadow.

### Responsive (mobile-first — phone, iPad, desktop)

- Write base styles for the **smallest** screen, then layer up with the `xs/sm/md/lg/xl` variants (breakpoint tokens defined in `@theme`).
- Required layout behavior across the device targets:

| Variant | ≥ width | Device | Sidebar | Song grid |
| ------- | ------- | ------ | ------- | --------- |
| (base) | 0 | small phone | hidden · bottom nav | 1 col |
| `xs:` | 425px | large phone | hidden · bottom nav | 2 col |
| `sm:` | 576px | small tablet | hidden · bottom nav | 2 col |
| `md:` | 768px | iPad portrait | collapsed rail | 3 col |
| `lg:` | 1024px | iPad landscape / desktop | full sidebar | 4 col |
| `xl:` | 1280px | large desktop | full sidebar | 5 col |

- The player bar is **fixed, full-width at the bottom on every size** and never unmounts.
- Touch targets (play, like, nav) are ≥ 44×44px at touch widths; cover art uses `<Image>` with a responsive `sizes` attribute.
- Verify each layout by viewing the running app at ~375px, 768px, 1024px, and 1440px (the `/run` and `verify` skills can screenshot these widths).

---

## File and Folder Naming

- Folders: kebab-case (`components/player`, `lib/supabase`).
- React components: PascalCase files (`PlayerBar.tsx`, `SongItem.tsx`), one component per file, named to match the component.
- Hooks: camelCase with `use` prefix (`useLoadSongUrl.ts`).
- Zustand stores: `use-*.ts` kebab-case (`use-player.ts`, `use-upload-modal.ts`).
- Server reads: verb-first kebab-case (`get-songs.ts`, `get-liked-songs.ts`).
- Server actions: verb-first kebab-case (`toggle-like.ts`, `create-playlist.ts`).
- Types: `index.ts` for domain types; generated DB types in `database.types.ts`.
- Route files follow Next.js conventions exactly (`page.tsx`, `layout.tsx`, `route.ts`).

---

## Module / Component Structure

Canonical order inside a client component:

```tsx
'use client'

// 1. external imports
import { useState } from 'react'
// 2. internal imports (via @/ alias)
import { usePlayer } from '@/stores/use-player'
import type { Song } from '@/types'

// 3. props type
interface SongItemProps {
  song: Song
  onClick: (id: string) => void
}

// 4. component
export function SongItem({ song, onClick }: SongItemProps) {
  // hooks first, then derived values, then handlers, then JSX
  return <button onClick={() => onClick(song.id)}>{song.title}</button>
}
```

- Hooks at the top, then derived values, then handlers, then the returned JSX.
- Props typed via a named `*Props` interface; destructure props in the signature.
- No inline business logic in JSX — extract to a handler or a `src/server`/`src/actions` function.

---

## Boundary Patterns

Mutations share one return contract:

```typescript
export type ActionResult<T = void> = { data: T } | { error: string }
```

### Server-side data fetcher (read)

```typescript
// src/server/search-songs.ts
import { createClient } from '@/lib/supabase/server'
import type { Song } from '@/types'

export async function searchSongs(query: string): Promise<Song[]> {
  const supabase = await createClient()
  // Strip characters that have meaning in PostgREST's filter grammar ( , ( ) * : " \ )
  // and escape ilike wildcards (% _), so user input can't break or extend the .or() filter.
  const q = query.replace(/[,()*:"\\]/g, ' ').replace(/[%_]/g, '\\$&').trim()
  if (!q) return []

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    // match the sanitized query against BOTH title and author (RLS still limits to visible songs)
    .or(`title.ilike.%${q}%,author.ilike.%${q}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[searchSongs]', error.message)
    return []
  }
  return data ?? []
}
```

- Reads return the data (or `[]`/`null` on error) and **log** the error; they never throw to the page.
- Reads never mutate and never run on the client.
- When interpolating user input into a PostgREST filter string (`.or()` / `.filter()`), **sanitize it first** — strip filter-grammar control characters (`, ( ) * : " \`) and escape `ilike` wildcards (`% _`) — so input can't break or extend the filter (see `searchSongs`).

### Server Action (mutation)

```typescript
// src/actions/toggle-like.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

export async function toggleLike(songId: string): Promise<ActionResult<{ liked: boolean }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in.' }

  const { data: existing } = await supabase
    .from('liked_songs')
    .select('song_id')
    .eq('user_id', user.id)
    .eq('song_id', songId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('liked_songs')
      .delete()
      .eq('user_id', user.id)
      .eq('song_id', songId)
    if (error) {
      console.error('[toggleLike]', error.message)         // log raw server-side
      return { error: 'Could not update your like. Please try again.' }  // user-safe
    }
    revalidatePath('/liked')
    return { data: { liked: false } }
  }

  const { error } = await supabase
    .from('liked_songs')
    .insert({ user_id: user.id, song_id: songId })
  if (error) {
    console.error('[toggleLike]', error.message)
    return { error: 'Could not update your like. Please try again.' }
  }
  revalidatePath('/liked')
  return { data: { liked: true } }
}
```

- **Always** re-check `auth.getUser()` before writing; never accept a user id from the client.
- Return `{ data }` on success or `{ error }` on failure — never throw across the boundary.
- Revalidate affected paths (or invalidate the React Query key) after a successful write.

### Route Handler (OAuth callback)

```typescript
// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // only allow same-origin relative paths; never redirect to an external URL
  const nextParam = searchParams.get('next')
  const next = nextParam?.startsWith('/') ? nextParam : '/'

  // Behind a reverse proxy (Render binds the app to an internal localhost:PORT),
  // the origin parsed from request.url is the INTERNAL host — redirecting to it
  // sends users to e.g. localhost:10000. Use the configured public origin
  // (NEXT_PUBLIC_SITE_URL, the same value the client builds redirectTo from);
  // fall back to the request origin only when it isn't set (local dev).
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? origin

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }
  return NextResponse.redirect(`${base}${next}`)
}
```

- The only Route Handler in the app; no other route should perform mutations.
- Redirect only to the validated same-origin `next` path; the `profiles` row is created by the `handle_new_user` DB trigger, so the callback never upserts a profile itself.
- **Never redirect to `new URL(request.url).origin` in a proxied deploy** — that resolves to the internal `localhost:PORT` on Render. Redirect to `NEXT_PUBLIC_SITE_URL` (falling back to `origin` locally), as above.

---

## Error Handling

- Log server-side errors with a bracketed source tag: `console.error('[functionName]', error.message)`.
- Show user-facing failures with `sonner` (`toast.error('Could not upload song.')`) using friendly copy — never surface raw Supabase/Postgres error text to the user.
- A Server Action returns a **user-safe** message in `{ error }` and logs the raw error server-side (`console.error('[action]', err.message)`); the client may then `toast.error(res.error)` directly. Never place a raw Supabase/Postgres message into the returned `{ error }`.
- **Default to one generic friendly message** for insert/update failures — after client validation they're almost always internal bugs, session/RLS denials, or tampering, none of which the user can act on, and whose detail must not leak. Map a Postgres error to a specific message only for **expected, user-correctable** cases, via a **strict allowlist keyed on the error `code`** (e.g. unique-violation `23505` on a future playlist-title constraint → "That name is already used."). Never surface RLS/permission errors to the user.
- Reads degrade gracefully (return empty) and render an empty state; mutations report failure via the `ActionResult` `{ error }` shape.
- Never swallow an error silently — at minimum log it.
- **Upload cleanup:** if an upload sequence fails partway (the image upload or the `createSong` insert fails after the audio object is stored), delete the already-uploaded Storage object(s) before surfacing the error, so orphaned files never accumulate.

---

## Environment Variables

| Variable | Used In | Secret? |
| -------- | ------- | ------- |
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server Supabase clients, `next.config.ts` image host | No (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server Supabase clients | No (public) |
| `NEXT_PUBLIC_SITE_URL` | OAuth `redirectTo` for `signInWithOAuth` (set to the Render URL in production, `http://localhost:3000` locally) | No (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only admin tasks / seed scripts (never in app runtime) | **Yes — secret** |

Never hardcode keys, URLs, or secrets in source. The service-role key must never
be imported into client code or any component.

---

## Shared Constants

```typescript
// src/lib/constants.ts
export const STORAGE_BUCKETS = {
  songs: 'songs',
  images: 'images',
} as const

export const ACCEPTED_AUDIO_TYPES = ['audio/mpeg'] as const   // .mp3
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
```

Reference bucket names and accepted upload types from here — never inline the
string literals.

---

## Import Conventions

- Use the `@/` alias for everything under `src/` (`@/components/...`, `@/lib/...`). No deep relative paths (`../../..`) across top-level folders.
- Import order: external packages, then `@/` internal modules, then `type` imports, then styles.
- Never import `src/server/*` (server-only read functions that use the server client) into a `'use client'` component — they may run only in Server Components. **Server Actions in `src/actions/*` are the deliberate exception:** being `'use server'` RPCs, they are meant to be imported and invoked from client components/hooks (via an event handler, a React Query `mutationFn`, or a form `action`).

---

## Comments

- Comment the **why**, not the **what** — code should be self-explanatory.
- Document any non-obvious Supabase/RLS or Next.js async gotcha inline where it bites.
- `TODO:` comments must name what is undone; do not leave bare `TODO`.

---

## Dependencies

Before installing anything new, check:

1. Can it be done with the existing stack (Next.js, Supabase, React Query, Zustand, Radix)?
2. Is the package actively maintained and typed?
3. Does it duplicate something already approved?

Approved dependencies for this project:

- `next`, `react`, `react-dom` — framework + UI runtime.
- `typescript`, `@types/react`, `@types/node` — typing.
- `tailwindcss`, `@tailwindcss/postcss`, `postcss` — styling.
- `@supabase/supabase-js`, `@supabase/ssr` — DB/Auth/Storage clients.
- `@tanstack/react-query` — client server-state.
- `zustand` — client UI/player state.
- `use-sound` — audio playback.
- `@radix-ui/react-dialog`, `@radix-ui/react-slider` — modal + slider primitives.
- `@radix-ui/react-tooltip` — accessible hover/focus tooltips for icon-only controls (matches the Dialog/Slider Radix usage).
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers`, `@dnd-kit/utilities` — accessible drag-and-drop for reordering playlist tracks (pointer + touch + keyboard sensors; satisfies the mobile-first requirement).
- `react-hook-form` — forms.
- `react-icons` — icons.
- `sonner` — toasts.
- `clsx`, `tailwind-merge` — className composition.
- `uuid`, `@types/uuid` — Storage path ids.

Do not install any other packages without updating this list first.
