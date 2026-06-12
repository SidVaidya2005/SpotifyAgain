# Progress Tracker

> **Role:** Live build status — what's done, in progress, and next.
> **Read at the start of every session**; **update after every completed feature.**
> **Relates to:** mirrors `build-plan.md` exactly. Full per-feature history (verbatim
> decisions + verification logs) lives in `context/build-journal.md` — this file keeps
> only the live status, the checklist, and the durable gotchas distilled from it.

---

## Current Status

**Phase:** Phase 8 — Deployment **COMPLETE** — 🎉 **PROJECT COMPLETE (16/16)**, live + LIVE-VERIFIED by user 2026-06-12 ("everything working fine") at **https://spotifyagain.onrender.com**
**Last completed:** 16 Deploy to Render — live on Render (Node Web Service, reused existing Supabase project `vgsiwqrovctitxkruwpj`). Pinned Node 22 (`.nvmrc` + `engines`), added `render.yaml` blueprint. **Fixed a prod-only OAuth bug:** the callback redirected to `new URL(request.url).origin`, which behind Render's proxy is the internal `localhost:10000` — switched it to `NEXT_PUBLIC_SITE_URL`. Anon browse/play, Google sign-in, upload, like, playlist all verified live.
**Next:** — (build plan complete; remaining ideas are out-of-scope polish / more demo content)

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

---

## Out-of-scope polish (if asked)

- **Seed 3–6 public demo songs** — catalog has only **1** public song (thin first impression). Must
  go through the app's upload flow (audio + cover → Storage); not MCP-seedable.
- Bump Render free → Starter to kill the ~50s cold start.
- README / portfolio write-up.

## Untested (not single-account testable)

Cross-user negative RLS paths — visibility-gated INSERTs on `liked_songs`/`playlist_songs`,
reorder/remove on a non-owned playlist, cross-user `/playlist/[id]` + search visibility. All
validated **structurally** in Feature 06; need a 2nd real auth user to exercise at runtime.
