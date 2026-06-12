# Memory — Feature 05 Action gating, profiles & sign-out

Last updated: 2026-06-12

## What was built

Feature 05 (Phase 2, the last feature of Phase 2) — **built and verified
end-to-end**. All changes are **uncommitted** on `main`.

New files:
- `supabase/migrations/20260611202834_profiles_and_handle_new_user.sql` —
  `public.profiles` (id→auth.users on delete cascade, full_name, avatar_url,
  updated_at); RLS enabled; **owner-only** SELECT + UPDATE using
  `(select auth.uid()) = id`; **no INSERT policy**; `handle_new_user()`
  (`language plpgsql security definer set search_path = ''`, fully-qualified,
  `on conflict (id) do nothing`) + `on_auth_user_created` after-insert trigger;
  **idempotent backfill** of existing `auth.users`.
- `src/server/require-user.ts` — `requireUser(): Promise<User>`; server client →
  `getUser()` → `redirect('/')` when null. The personal-page redirect pattern;
  **not imported anywhere yet** (verified by build, not runtime).
- `src/components/UserMenu.tsx` — `'use client'`, props `{ user: User }`. Avatar
  button (real Google `user_metadata.avatar_url` via `<Image>` w/h 36, else
  initial-circle) → toggleable dropdown (`bg-card shadow-dialog`, name label +
  `Log out` w/ `FiLogOut`). Closes on click-outside + Escape via one `useEffect`
  that only attaches/detaches document listeners. `onSignOut`: client
  `supabase.auth.signOut()` → `console.error`+`toast.error` on failure, else
  `setOpen(false)` + `router.push('/')` + `router.refresh()`.

Modified:
- `src/components/Header.tsx` — signed-in branch now renders `<UserMenu user={user}/>`
  (replaced 04's minimal initial-circle); anon "Log in" pill unchanged.
- `next.config.ts` — added `lh3.googleusercontent.com` (`pathname:'/**'`) to
  `images.remotePatterns` (Google avatars).
- `src/providers/UserProvider.tsx` — comment-only (sign-out now fires SIGNED_OUT).
- `context/progress-tracker.md` — 05 checked off; Phase 2 complete; decisions logged.

Approved plan: `/Users/siddarthvaidya/.claude/plans/shimmying-churning-waterfall.md`.

## Decisions made

- **Auth surface = `Header`, NOT the sidebar** the build-plan §05 text names. Sidebar
  is hidden below `md`, so a sidebar-only sign-out would strand mobile users. Kept
  the 04 decision (avatar + dropdown in the Header, reachable at all breakpoints).
- **Sign-out = lightweight custom dropdown, no new dependency.** Deliberately did
  NOT add `@radix-ui/react-dropdown-menu`. Close-listener effect only attaches
  listeners (state set in handlers) → does not trip React 19 `set-state-in-effect`.
- **Sign-out is client-side** (`signOut()` only clears the cookie, not a DB write),
  so the "all DB writes via Server Actions" invariant does not apply.
- **Real Google avatar** read from the live `User` object (`user_metadata.avatar_url`),
  **not** from a `profiles` query. `profiles` table is infrastructure for later.
- **profiles RLS owner-only** (this project keeps profiles private, unlike the
  public-read Supabase quickstart examples). Confirmed canonical trigger form via
  Context7 `/supabase/supabase`.
- **`requireUser()` shipped now, consumed later.** Features 08 (`/library`),
  11 (`/liked`), 14 (`/playlist/[id]`) call it at the top of their Server Components.

## Problems solved

- **Supabase MCP could not be used this session.** OAuth completed in-browser
  ("authentication successful", callback `http://localhost:3118/callback?code=...`)
  but the harness never surfaced the MCP's real tools (execute_sql/apply_migration)
  into the tool registry — only the `authenticate`/`complete_authentication` stubs
  stayed available, and `complete_authentication` said "no flow in progress" (the
  local listener had already auto-captured it). **Fallback that worked: ran the
  committed `.sql` in the Supabase Dashboard SQL Editor.** Next session the MCP tools
  may have loaded — if not, use the dashboard again.
- **Dev server must run on PORT 3000** for OAuth (`NEXT_PUBLIC_SITE_URL=http://localhost:3000`).
  A second `npm run dev` collides → 3001 and bails. Background server was stopped at
  end of session (no stray process left).

## Current state

- **Feature 05 done + verified.** `npm run lint` + `npm run build` green (build still
  prints `ƒ Proxy (Middleware)`). Headless: anon `/` → 200 with "Log in" in SSR;
  `/library` & `/liked` → 307 → `/`. **User-confirmed live:** real Google avatar
  renders; avatar → dropdown → `Log out` → back to `/` with "Log in" pill.
- **Migration is APPLIED** to project ref **vgsiwqrovctitxkruwpj**. Post-apply check:
  `profile_count = user_count = 1`, `policy_count = 2`, `trigger_exists = true`.
- **Phase 2 (Authentication) complete.** Phase 1 + 2 done (features 01–05).
- **All Feature-05 changes uncommitted** on `main`. Prior features were committed by
  the user (latest commit `de67864 2.4-google-signin-oauth-flow`).

## Next session starts with

1. **Commit decision (UNANSWERED).** Proposed message per repo convention
   (phase.feature): **`2.5-action-gating-profiles-signout`**. **Never add a co-author**
   (global CLAUDE.md). Confirm whether to commit or the user will.
2. Then **06 Database schema & storage** (Phase 3, first feature). Per CLAUDE.md read
   `context/` first. Scope: ONE migration adding the full catalog —
   `songs` (incl. `is_public`), `playlists`, `playlist_songs`, `liked_songs` with the
   columns + RLS from `architecture.md` (songs SELECT = public-or-own; `liked_songs`
   and `playlist_songs` INSERT additionally require the referenced song be visible);
   create `songs` + `images` Storage buckets (public-read + owner-write); generate
   `src/types/database.types.ts` and add domain aliases in `src/types/index.ts`
   (already has `Song` + `ActionResult` — the generated types will supersede `Song`).
   `profiles` already exists (05) — 06's migration is additive, don't recreate it.

## Open questions

- Commit 05 now as `2.5-action-gating-profiles-signout`, or user commits himself?
- For 06: apply via Supabase MCP (re-check if tools load) or Dashboard SQL Editor
  again? And how to generate `database.types.ts` — Supabase CLI (`npx supabase gen
  types`, needs link) vs MCP. Storage buckets can be created in the same SQL migration
  (`insert into storage.buckets ...` + policies) or via dashboard.
