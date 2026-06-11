# Memory — Feature 03 Supabase clients & middleware

Last updated: 2026-06-12

## What was built

Feature 03 (Phase 1) — Supabase wired in, no UI change. All changes are
**uncommitted** on `main` (working tree). New files:

- `src/lib/supabase/client.ts` — browser client (`createBrowserClient`).
- `src/lib/supabase/server.ts` — server client; async `cookies()`, `getAll`/`setAll`,
  `setAll` try/caught for Server-Component calls.
- `src/lib/supabase/middleware.ts` — `updateSession(request)` helper: refreshes
  session, redirects to `/` when no user AND path starts with `/library`|`/liked`|`/playlist`.
- `src/proxy.ts` — Next 16 request entry (`export async function proxy`) calling
  `updateSession`; `config.matcher` excludes `_next/*` + static assets.
- `.env.local` (gitignored) — real project URL + anon key (publishable key).
- `.env.example` (committed; un-ignored via `!.env.example` in `.gitignore`).

Modified: `next.config.ts` (added `images.remotePatterns` for
`vgsiwqrovctitxkruwpj.supabase.co` → `/storage/v1/object/public/**`; kept
`turbopack.root`); `.gitignore`; context docs `architecture.md`,
`library-docs.md`, `build-plan.md`, `progress-tracker.md` (03 checked off,
decisions logged). Supabase project ref: **vgsiwqrovctitxkruwpj**.

Approved plan: `/Users/siddarthvaidya/.claude/plans/03-supabase-clients-hashed-acorn.md`.

## Decisions made

- **Root entry is `proxy.ts`, not `middleware.ts`** (architect-session decision).
  Next 16 deprecated `middleware.ts`/`export middleware` → `proxy.ts`/`export proxy`
  (nodejs runtime, no edge). `16.2.9` carries both `MIDDLEWARE_FILENAME` and
  `PROXY_FILENAME` constants; `middleware.ts` still works but warns. Context docs
  were updated to say `proxy.ts`.
- **`proxy.ts` MUST live in `src/`** (not repo root) because the app is in `src/`.
  Root-level proxy is silently ignored. The `src/lib/supabase/middleware.ts` helper
  keeps its name (it's an internal lib file, not the entry).
- **Real Supabase creds now** (not placeholders) — enables real `getUser()`
  verification and unblocks Feature 04.
- **Committed `.env.example`** as the key template for reviewers; `images.remotePatterns`
  pinned to the specific project host (not a wildcard).
- The `src/lib/supabase/middleware.ts` `updateSession` body and the client/server
  bodies are verbatim from `architecture.md` → Key Patterns (Context7 confirmed the
  `getAll`/`setAll` cookie API is current for `@supabase/ssr@0.12`).

## Problems solved

- **Root `proxy.ts` was silently ignored** — empty `middleware-manifest.json`, no
  `Proxy` line in build output. Fix: move to `src/proxy.ts`. Verification signal:
  `npm run build` prints `ƒ Proxy (Middleware)` ONLY when it's in `src/`.
- **App Router private-folder gotcha** — a temp verify page at `(site)/__verify/`
  404'd because folders prefixed with `_` are private (excluded from routing).
  Renamed to `verify-scratch` to make it routable (then deleted it).
- **`getUser()` for anonymous returns `{ user: null, error: "Auth session missing!" }`**
  — this is the EXPECTED no-session state, not a failure. Gate on `!user`; ignore
  that error, never surface it.

## Current state

- **Feature 03 done and verified.** `npm run lint` clean; `npm run build` green
  (no deprecation warning; `ƒ Proxy (Middleware)` wired). Dev run: `/` → 200 for
  anon with proxy running + `getUser()`→null clean; `/library` & `/liked` → 307→`/`;
  non-protected path 404s without redirect; server client constructs fine in a
  Server Component (temp page, since removed).
- `progress-tracker.md`: Phase 1 complete; Last completed = **03**, Next = **04**.
- **All changes uncommitted.** No providers/UI added yet (correct — that's 04+).

## Next session starts with

1. **Decide: commit Feature 03 first?** User was asked at end of session and hadn't
   answered. If committing, **never add a co-author** (global CLAUDE.md rule).
2. Then **04 — Google sign-in** (Phase 2). Per CLAUDE.md read `context/` first; pull
   `@supabase/ssr` `signInWithOAuth` (google) + Next.js 16 Route Handler docs from
   Context7. Scope: `AuthModal` (Radix Dialog) + `use-auth-modal` store +
   "Continue with Google" → `signInWithOAuth({ provider:'google', redirectTo:
   '<site>/auth/callback?next=<path>' })`; `src/app/auth/callback/route.ts`
   exchanges code → redirects to validated same-origin `next`; `UserProvider`/`useUser`.
   Note: profiles table + `handle_new_user` trigger is Feature 05/06, NOT 04.

## Open questions

- Commit 03 now or roll it into a later commit? (unanswered)
- Google OAuth provider isn't configured in Supabase Auth yet, and the
  `auth.users`/`profiles` schema + `handle_new_user` trigger don't exist (Feature
  06). Feature 04 can build the sign-in UI/flow, but a full end-to-end OAuth test
  needs the Google provider enabled in the Supabase dashboard + a redirect URL
  allowlisted — confirm whether to set that up when starting 04.
