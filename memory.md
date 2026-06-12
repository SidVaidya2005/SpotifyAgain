# Memory — Feature 07 Upload Song Flow

Last updated: 2026-06-12

## What was built

Feature 07 (Phase 3, second feature) — **built and headless-verified**. All changes
are **uncommitted** on `main` (latest commit `6c8fa49 3.6-catalog-schema-and-storage`).

New files:
- `src/stores/use-upload-modal.ts` — Zustand store, exact shape of `use-auth-modal`
  (`isOpen`/`onOpen`/`onClose`).
- `src/actions/create-song.ts` — **first real Server Action**. `'use server'`; server
  `createClient()`; re-checks `getUser()` → `{ error: 'You must be signed in to upload.' }`
  if null; inserts `{ user_id: user.id, title, author, song_path, image_path, is_public }`
  into `songs`, `.select('id').single()`; logs raw on error + returns user-safe
  `{ error: 'Could not save the song. Please try again.' }`; `revalidatePath('/library')`
  + `revalidatePath('/')`; returns `ActionResult<{ id }>`. Input type
  `{ title; author; songPath; imagePath; isPublic }`.
- `src/components/modals/UploadModal.tsx` — `'use client'`, wraps the existing `Modal`
  (title "Add a song", desc "Upload an MP3 with cover art."), driven by
  `use-upload-modal`. `react-hook-form` fields: `title`, `author` (required text),
  `song`/`image` (required file inputs), `isPublic` (checkbox, default `true`). Submit
  handler: guards `user`/files/type → `uid=uuidv4()`, paths `${user.id}/${uid}.mp3` and
  `${user.id}/${uid}.${ext}` → upload audio → upload image (remove audio on fail) →
  `createSong` (remove both on `{error}`) → `toast.success('Song uploaded.')` + `reset()`
  + `onClose()` + `router.refresh()`. try/catch wraps the upload steps → single friendly
  `toast.error`. Inputs disabled while `isSubmitting`; modal won't close mid-submit.

Modified:
- `src/providers/ModalProvider.tsx` — mounts `<UploadModal />` next to `<AuthModal />`.
- `src/components/Header.tsx` — added a **signed-in-only** circular "+" button
  (`react-icons/FiPlus`, `aria-label="Upload song"`, h-11 w-11, `bg-surface-2`) before
  `<UserMenu>` that calls `useUploadModal().onOpen()`. Anonymous users still see "Log in".
- `context/progress-tracker.md` — 07 checked off; status → "08 next"; full decision log appended.

Approved plan: `/Users/siddarthvaidya/.claude/plans/07-upload-song-flow-bubbly-canyon.md`.

## Decisions made

- **Upload trigger lives in the `Header`, NOT the Sidebar/Library.** Build-plan §07 implies
  the Library, but `/library` doesn't exist until Feature 08/12 and the Sidebar is hidden
  below `md`. A signed-in-only "+" in the Header is reachable at every breakpoint. **Move /
  duplicate it into the Library page when that lands.**
- **Scope kept strict: 07 = upload only.** Did NOT pull Feature 08 (real catalog reads)
  forward. Home still renders `MOCK_SONGS`; there's no `/library` page. So `router.refresh()`
  on success is visually a no-op for now — the uploaded song won't appear in the UI until
  Feature 08 wires real reads (the action already `revalidatePath('/')` + `'/library'`).
- **public/private = plain native checkbox** ("Make this song public", default checked).
  `DESIGN-spotify.md` has no switch/toggle spec, so used a token-styled checkbox
  (`accent-accent`) rather than invent a control. Inputs use `shadow-inset-border` +
  `bg-surface-2` (DESIGN §4); file inputs styled via Tailwind `file:` variants.
- **Storage path prefix is client-derived (`useUser().id`) but the inserted `user_id` is
  server-trusted** (`getUser()` in the action). Storage RLS (`foldername[1]=auth.uid()`)
  rejects a forged prefix, so this is safe.
- **React Query NOT used here** (still deferred to Feature 11). Success path = action
  `revalidatePath` + client `router.refresh()`.

## Problems solved

- **`.includes(File.type)` vs `as const` tuples** — `ACCEPTED_AUDIO_TYPES`/`ACCEPTED_IMAGE_TYPES`
  are readonly literal tuples, so `.includes(someString)` won't type-check. Fixed with
  `const audioTypes: readonly string[] = ACCEPTED_AUDIO_TYPES` widening views (no `any`).
  `accept` attrs derive from the same constants via `.join(',')`.
- **All deps already installed** (Feature 01 installed approved deps up front) — `react-hook-form`,
  `uuid`, `@radix-ui/react-dialog`, `sonner`, `react-icons` all present. No `npm install` needed.

## Current state

- **Feature 07 built + headless-verified.** `npm run lint` clean; `npm run build` green
  (still prints `ƒ Proxy (Middleware)`; `/` `ƒ (Dynamic)`).
- **Live upload round-trip NOT yet run** — needs a user (Google OAuth + real file picker).
  Headless can't exercise it. User should: dev → sign in → "+" → upload real MP3+cover
  (public, then private) → expect toast + `songs` row + objects in `songs`/`images` buckets.
- **Phases 1 + 2 + Features 06, 07 done.** Catalog UI is still mock (`MOCK_SONGS` in
  `src/app/(site)/page.tsx`); no `/library` page yet.
- **All Feature-07 changes uncommitted** on `main`. No commit made (user hasn't asked).

## Next session starts with

1. **(Optional) Live-verify 07** per above if not yet done by the user.
2. **Commit decision (UNANSWERED).** Proposed message per repo convention (phase.feature):
   **`3.7-upload-song-flow`**. **NEVER add a co-author** (global CLAUDE.md). Confirm whether
   to commit or the user will.
3. Then **08 Home & library wired to real songs** (Phase 3, final feature). Per CLAUDE.md read
   `context/` first. Scope: `src/server/get-songs.ts` (RLS-scoped, recently-uploaded public +
   own) feeding Home — **replace `MOCK_SONGS`** in `src/app/(site)/page.tsx`; create
   `src/server/get-songs-by-user.ts` + the `/library` page (`src/app/(site)/library/page.tsx`,
   a Server Component that calls `requireUser()` from `src/server/require-user.ts`) listing the
   user's uploads (public + private). `getSongs` read pattern is in `architecture.md` → Key
   Patterns. This is when uploaded songs finally become visible — verifies 07 end-to-end too.
   Note: cover images render via `<Image>` (Supabase Storage host already in
   `next.config.ts` remotePatterns) — `SongItem` currently shows a placeholder, may wire art here.

## Open questions

- Commit 07 now as `3.7-upload-song-flow`, or user commits himself?
- For 08: where does the upload "+" trigger ultimately live — keep in Header, or move into the
  new `/library` page (and/or duplicate)? Decided to revisit when Library lands (= now, at 08).
- The cross-user visibility-gated INSERT (`liked_songs`/`playlist_songs` "song must be visible")
  is still NOT runtime-tested (needs a 2nd real auth user + data + sessions). Lands in Features
  08/11 — verify there.
- Live upload round-trip + orphan-cleanup path (force `createSong` error, confirm Storage objects
  removed) not yet exercised — optional manual check.
