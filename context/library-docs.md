# Library Docs

> **Role:** Project-specific usage patterns for each third-party library.
> **Read the relevant section** before using a library.
> **Relates to:** covers the integrations in `architecture.md`; defers to MCP servers and skills first.

Project-specific usage patterns for the third-party libraries that have
**non-trivial, project-specific rules**. This is not exhaustive: trivial helpers
(`clsx`, `tailwind-merge`, `uuid`, `react-icons`) are summarized briefly at the
end, and anything not covered here follows Context7 / upstream docs plus the
conventions in `code-standards.md`. Read the relevant section before implementing
a feature that touches one of these libraries.

---

## Before Using Any Library

Before implementing any feature that uses a third party library:

1. **Pull live docs from the Context7 MCP first.** It is installed and connected (`plugin:context7:context7`). Use its two tools (exact names vary by client — `resolve-library-id`/`query-docs` or `resolve_library_id`/`query_docs`): first **resolve the library id** from the package name to a Context7 ID — e.g. `/supabase/ssr`, `/vercel/next.js`, `/tailwindlabs/tailwindcss` — then **query its docs** with that id and a specific natural-language question (e.g. "createServerClient cookies in Next.js 15", "@theme tokens in v4", "signInWithOAuth google redirect"). Pin a version by appending it to the id (`/org/project/version`) when it matters. This is the first stop for any API you are unsure about — Tailwind v4 `@theme`, `@supabase/ssr`, Next.js 15 async APIs, and React Query v5 all changed recently and training knowledge may be stale.
2. **Use the Supabase MCP** (`plugin:supabase:supabase`, configured — authenticate once) for project-specific database, schema, and RLS questions.
3. **Check `CLAUDE.md`** at the project root (the agent entry point for this repo) and any installed skills for codebase-specific patterns.
4. **Read this file** for project-specific patterns that override general library knowledge.

The order of authority is:

```
Context7 / MCP servers (real-time docs) → Skills / `CLAUDE.md` → This file (project rules) → General training knowledge
```

Never rely on general training knowledge alone for library APIs — they change
frequently and training data may be outdated. When Context7 and this file disagree
on an API shape, trust Context7 for the current API and this file for the
project-specific rules around it.

---

## @supabase/ssr + @supabase/supabase-js

**Check first:** the Supabase MCP server if configured, then the canonical
client snippets in `architecture.md` → Key Patterns.

### Setup

Construct clients **only** in `src/lib/supabase/`. Browser components import the
browser client; Server Components / Actions / Route Handlers import the server
client. See `architecture.md` → Key Patterns for the full `client.ts`,
`server.ts`, and `middleware.ts` bodies. `middleware.ts` at the repo root wires
it up:

```typescript
// middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

### Google OAuth sign-in (client)

```typescript
'use client'
import { createClient } from '@/lib/supabase/client'

async function signInWithGoogle() {
  const supabase = createClient()
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  })
}
```

The callback route (`src/app/auth/callback/route.ts`) calls
`supabase.auth.exchangeCodeForSession(code)` — see `code-standards.md`.

### Reading the current user

```typescript
// Server side (trusted): always use getUser(), never getSession() for auth checks.
const { data: { user } } = await supabase.auth.getUser()
```

### Upload: client Storage upload → `createSong` Server Action

Files go **client-side** straight to Storage (direct-to-Storage avoids routing
multi-MB audio through a Server Action); the DB row is then inserted by a Server
Action. On any failure after an upload, the client removes the orphaned object(s).

```typescript
'use client'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@/lib/supabase/client'
import { STORAGE_BUCKETS } from '@/lib/constants'
import { createSong } from '@/actions/create-song'

async function uploadSong(
  userId: string,
  songFile: File,
  imageFile: File,
  title: string,
  author: string,
  isPublic: boolean,            // public/private toggle, defaults to true
) {
  const supabase = createClient()
  const uid = uuidv4()
  const ext = imageFile.name.split('.').pop() ?? 'jpg'
  const songPath = `${userId}/${uid}.mp3`
  const imagePath = `${userId}/${uid}.${ext}`

  const { error: songErr } = await supabase.storage
    .from(STORAGE_BUCKETS.songs)
    .upload(songPath, songFile, { cacheControl: '3600', upsert: false })
  if (songErr) throw songErr

  const { error: imgErr } = await supabase.storage
    .from(STORAGE_BUCKETS.images)
    .upload(imagePath, imageFile, { cacheControl: '3600', upsert: false })
  if (imgErr) {
    await supabase.storage.from(STORAGE_BUCKETS.songs).remove([songPath]) // cleanup
    throw imgErr
  }

  // DB write goes through a Server Action (re-checks getUser, RLS owner-write)
  const res = await createSong({ title, author, songPath, imagePath, isPublic })
  if ('error' in res) {
    await supabase.storage.from(STORAGE_BUCKETS.songs).remove([songPath])
    await supabase.storage.from(STORAGE_BUCKETS.images).remove([imagePath])
    throw new Error(res.error)
  }
}
```

The matching Server Action:

```typescript
// src/actions/create-song.ts
'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

interface CreateSongInput {
  title: string; author: string; songPath: string; imagePath: string; isPublic: boolean
}

export async function createSong(input: CreateSongInput): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to upload.' }

  const { data, error } = await supabase
    .from('songs')
    .insert({
      user_id: user.id,
      title: input.title,
      author: input.author,
      song_path: input.songPath,
      image_path: input.imagePath,
      is_public: input.isPublic,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[createSong]', error.message)        // log raw server-side
    return { error: 'Could not save the song. Please try again.' }  // user-safe
  }
  revalidatePath('/library')
  revalidatePath('/')
  return { data: { id: data.id } }
}
```

### Resolving a public URL

```typescript
const { data } = supabase.storage.from(STORAGE_BUCKETS.songs).getPublicUrl(song.song_path)
const url = data.publicUrl
```

**Rules:**

- Use `getUser()` (not `getSession()`) for any server-side authorization decision.
- Storage object paths are always `"<user_id>/<uuid>.<ext>"` (audio `.mp3`, image keeps its real extension); never write outside the user's own prefix.
- **DB writes go through a Server Action** (`createSong`, `toggleLike`, …), never a client `.insert()`; Storage uploads are the only client-side write, and the client cleans up uploaded objects if a later step fails.
- Let RLS enforce ownership and visibility — `songs` SELECT returns public rows to everyone plus the viewer's own private rows, so do not re-implement that filter in app code; for private tables (`playlists`, `liked_songs`, `playlist_songs`) RLS scopes by `auth.uid()` and INSERTs may reference only songs visible to the user.
- `is_public` defaults to `true`; pass the upload modal's toggle value through to `createSong`.
- In production, `redirectTo` resolves to `${NEXT_PUBLIC_SITE_URL}/auth/callback` where `NEXT_PUBLIC_SITE_URL` is the Render URL — keep it in sync with the Supabase Auth redirect allowlist.
- Never use the service-role key in client code or components.
- Generate `database.types.ts` with the Supabase CLI and type every query against it.

---

## @tanstack/react-query (v5)

**Check first:** TanStack Query v5 docs — note v5 renamed `cacheTime` → `gcTime` and uses the single-object signature.

### Setup

```tsx
// src/providers/ReactQueryProvider.tsx
'use client'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000 } },
  }))
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
```

### Mutation that calls a Server Action

```tsx
'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { toggleLike } from '@/actions/toggle-like'

export function useToggleLike(songId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await toggleLike(songId)
      if ('error' in res) throw new Error(res.error)
      return res.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['liked-songs'] }),
    onError: (e) => toast.error(e.message || 'Something went wrong.'), // action returns a user-safe message
  })
}
```

**Rules:**

- Use React Query for **client-side** reactive reads/mutations (liked state, playlist edits). Initial page data stays in Server Components.
- Query keys are arrays with a stable first segment (`['liked-songs']`, `['playlist', id]`). Invalidate by that key after a mutation.
- v5: it's `gcTime`, not `cacheTime`; all hooks take a single options object.
- Mutation `mutationFn` unwraps the `ActionResult` and throws on `{ error }` so `onError` fires.

---

## zustand (v5)

**Check first:** this file — stores here follow one fixed shape.

### Setup

See `usePlayer` in `architecture.md` → Key Patterns. Modal stores follow the
same minimal shape:

```typescript
// src/stores/use-upload-modal.ts
import { create } from 'zustand'

interface UploadModalState {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useUploadModal = create<UploadModalState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))
```

**Rules:**

- Stores hold **ephemeral UI/player state only** — never domain data, never Supabase calls.
- Select narrowly to avoid re-renders: `const activeId = usePlayer((s) => s.activeId)`.
- One store per concern (`use-player`, `use-upload-modal`, `use-auth-modal`); do not create a single global store.

---

## use-sound

**Check first:** the `use-sound` README; it wraps Howler and returns a `[play, controls]` tuple.

### Usage (player)

```tsx
'use client'
import useSound from 'use-sound'
import { useEffect } from 'react'
import { usePlayer } from '@/stores/use-player'

function PlayerContent({ songUrl }: { songUrl: string }) {
  const { ids, activeId, setId } = usePlayer()

  const onPlayNext = () => {
    if (!ids.length) return
    const i = ids.findIndex((id) => id === activeId)
    setId(ids[i + 1] ?? ids[0])
  }

  const [play, { pause, sound }] = useSound(songUrl, {
    format: ['mp3'],
    onend: onPlayNext,
    onplay: () => {/* set playing */},
    onpause: () => {/* set paused */},
  })

  useEffect(() => {
    sound?.play()
    return () => { sound?.unload() }
  }, [sound])

  return null // controls bound to play/pause/sound
}
```

**Rules:**

- The player is mounted once in the app shell and keyed by `songUrl` so it reloads when the active track changes.
- Always `sound?.unload()` on cleanup to avoid leaking Howl instances.
- Seek/volume go through the `sound` instance (`sound.seek(...)`, `sound.volume(...)`); next/previous mutate `usePlayer`.

---

## Radix UI (Dialog + Slider)

**Check first:** Radix Primitives docs for `@radix-ui/react-dialog` and `@radix-ui/react-slider`.

### Modal shell (Dialog)

```tsx
'use client'
import * as Dialog from '@radix-ui/react-dialog'

export function Modal({ open, onOpenChange, title, children }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-base/80" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-card p-6 text-text shadow-dialog">
          <Dialog.Title className="text-2xl font-bold">{title}</Dialog.Title>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

**Rules:**

- All modals (upload, auth, playlist) wrap this `Modal` and drive `open`/`onOpenChange` from their Zustand store.
- The seek and volume bars use `@radix-ui/react-slider`; keep them controlled from the player state.
- Always render Dialog content inside `Dialog.Portal` and include a `Dialog.Title` for accessibility.

---

## react-hook-form

**Check first:** react-hook-form docs; used for the upload and playlist forms.

### Usage

```tsx
'use client'
import { useForm } from 'react-hook-form'

interface UploadValues { title: string; author: string; song: FileList; image: FileList }

export function UploadForm({ onSubmit }: { onSubmit: (v: UploadValues) => Promise<void> }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<UploadValues>({
    defaultValues: { title: '', author: '' },
  })
  return (
    <form onSubmit={handleSubmit(async (v) => { await onSubmit(v); reset() })}>
      <input {...register('title', { required: true })} disabled={isSubmitting} />
      <input {...register('author', { required: true })} disabled={isSubmitting} />
      <input type="file" accept="audio/mpeg" {...register('song', { required: true })} />
      <input type="file" accept="image/*" {...register('image', { required: true })} />
      <button type="submit" disabled={isSubmitting}>Upload</button>
    </form>
  )
}
```

**Rules:**

- Mark required fields with `{ required: true }`; disable inputs while `isSubmitting`.
- File inputs yield a `FileList` — read `files[0]`; validate type against `ACCEPTED_*` constants from `@/lib/constants`.
- `reset()` the form after a successful submit and close the modal.

---

## Next.js 15 (App Router)

**Check first:** Context7 `/vercel/next.js` for async `cookies()`/`params`, Server Actions, and caching — these changed in 15.

This project's framework conventions (Server Components by default, async dynamic
APIs, Server Actions for writes, `<Image>` for art) live in `code-standards.md` →
Next.js Conventions. Follow that section and verify any uncertain API against
Context7 — there is no separate snippet to copy here.

---

## Tailwind CSS v4

**Check first:** Context7 `/tailwindlabs/tailwindcss.com` for `@theme`, `@utility`, and `@layer components`.

- Design tokens are defined once in `globals.css` via `@theme` — the canonical block is in `architecture.md` → Key Patterns. Style with the generated semantic utilities (`bg-surface`, `text-muted`, `rounded-pill`, `shadow-dialog`); never inline raw hex/px.
- v4 is configured **in CSS** (`@import "tailwindcss"`), not `tailwind.config.js`. Add custom utilities with `@utility`, shared component classes with `@layer components`.

---

## next/font + next/image

**Check first:** Context7 `/vercel/next.js` (topics "next/font google", "next/image remotePatterns").

```typescript
// src/app/layout.tsx — load Figtree once, expose as a CSS variable
import { Figtree } from 'next/font/google'

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
// apply figtree.variable on <html> so the @theme --font-sans token resolves
```

- Cover art renders through `<Image>`; the Supabase Storage host must be listed in `next.config.ts` → `images.remotePatterns`, and each `<Image>` needs a responsive `sizes` attribute (see the grid breakpoints in `code-standards.md`).

---

## sonner (toasts)

**Check first:** the `sonner` README (or Context7).

- Mount `<Toaster />` once in a `ToasterProvider` in the root layout.
- Use `toast.success(...)` / `toast.error(...)` with friendly copy; never surface raw Supabase/Postgres error strings (see `code-standards.md` → Error Handling).

---

## Utility libraries (brief)

No project-specific rules beyond standard use:

- **`clsx` + `tailwind-merge`** — compose into one `cn()` helper in `src/lib/utils.ts` (`twMerge(clsx(inputs))`); use it for all conditional/merged class names.
- **`uuid`** — `v4()` only, for Storage object ids (`<user_id>/<uuid>.<ext>`).
- **`react-icons`** — import per-icon from the relevant set; default icon size/color come from `DESIGN-spotify.md` (§9 quick reference).

---
