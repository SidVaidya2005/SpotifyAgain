# Memory — Feature 04 Google sign-in

Last updated: 2026-06-12

## What was built

Feature 04 (Phase 2) — Google OAuth sign-in, **built end-to-end and verified
including a live round-trip**. All changes are **uncommitted** on `main`.

New files:
- `src/stores/use-auth-modal.ts` — `{ isOpen, onOpen, onClose }` (minimal; carries no `next`).
- `src/components/Button.tsx` — pill primitive, `variant="pill"`(green accent CTA) / `white`(OAuth) / `outline`. Uses `cn()`.
- `src/components/Modal.tsx` — reusable Radix `Dialog` shell (Overlay+Content+Title+Description+Close X). Upload/Playlist modals (07/13) will reuse it.
- `src/components/modals/AuthModal.tsx` — "Continue with Google" (`FcGoogle`) → `signInWithOAuth({ provider:'google', options:{ redirectTo: \`${NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(pathname)}\` } })`; error → `toast.error`.
- `src/providers/UserProvider.tsx` — exports `UserContext` + `UserProvider({ initialUser })`; `useState(initialUser)` + `onAuthStateChange` (unsub on cleanup).
- `src/hooks/useUser.ts` — reads `UserContext`, throws outside provider, returns `{ user }`.
- `src/providers/ModalProvider.tsx` — renders `<AuthModal/>` (NO mounted-guard, see Problems).
- `src/providers/ToasterProvider.tsx` — sonner `<Toaster theme="dark" position="bottom-center" />`.
- `src/components/Header.tsx` — top bar: anon → "Log in" pill (opens AuthModal); signed-in → minimal initial-circle indicator. Wordmark shown only `<md`.
- `src/app/auth/callback/route.ts` — `exchangeCodeForSession(code)` → redirect to validated same-origin `next` (success) or `/` (no code / error). No profile write.

Modified:
- `src/app/layout.tsx` — now **async server component**: reads `getUser()`, wraps body in `<UserProvider initialUser={user}>`, renders `<ToasterProvider/>`+`<ModalProvider/>`, inserts `<Header/>` in a new content column above `<main>` (`<div className="flex flex-1 flex-col overflow-hidden"><Header/><main…/></div>`). Sidebar/PlayerBar/BottomNav positions unchanged.
- `context/progress-tracker.md` — 04 checked off, status + decisions logged.

Approved plan: `/Users/siddarthvaidya/.claude/plans/eager-wishing-cray.md`.

## Decisions made

- **Auth surface = new top `Header`** (chosen over sidebar/bottom-nav buttons). Real triggers (upload/like/playlist) don't exist yet, so a "Log in" pill in the Header is the entry point at all breakpoints. 05 evolves the signed-in state into sidebar avatar + sign-out.
- **`useUser` is client context, server-seeded** (chosen over client-only fetch) → no logged-out→logged-in flicker. `layout.tsx` reads `getUser()` and passes `initialUser`; `onAuthStateChange` keeps it live.
- **`ReactQueryProvider` deferred to Feature 11** (likes); not mounted yet. Only User/Modal/Toaster providers now.
- **Introduced `Button` + `Modal` primitives now** per code-standards (first reusable buttons/modal). `AuthModal`'s Google button uses `variant="white"`.
- **Signed-in indicator in 04 is minimal** (initial-circle, not the Google avatar image — its host isn't in `next.config` `remotePatterns`; 05 handles the real avatar). No sign-out control in 04 (that's 05).
- **option-b workflow:** code built first, then user enabled Google provider + allowlisted redirect in the dashboards, then live test. Dashboard/Google-Cloud config is **external (not in repo)** — must be repeated for the Render URL at deploy (Feature 16).

## Problems solved

- **Modal "mounted-guard" now fails lint.** The classic `useState(false)` + `useEffect(() => setIsMounted(true))` pattern errors under React 19's `react-hooks/set-state-in-effect` ("setState synchronously within an effect"). It's unnecessary anyway — a modal's `open` starts `false` on server and client (Radix portals content only when open) → no hydration mismatch. `ModalProvider` just renders `<AuthModal/>`. **Don't reintroduce the guard in future modals.**
- **`text-black` vs `text-base`** (carried from 02): use built-in `text-black` (#000) for the play/CTA icon black; `text-base` is a font-size util that collides with `--color-base`.

## Current state

- **Feature 04 done + verified end-to-end.** `npm run lint` clean; `npm run build` green (still prints `ƒ Proxy (Middleware)`; `/` now `ƒ (Dynamic)` because layout reads `getUser()`). Headless: anon `/` → 200 with "Log in" in SSR HTML (no flicker); `/auth/callback` (no code) → 307 → `/`; `/library` (anon) → 307 → `/`; clean dev log.
- **Live OAuth round-trip CONFIRMED WORKING by the user** after they: enabled Google in Supabase Auth → Providers, allowlisted `http://localhost:3000/auth/callback`, added the Supabase callback to the Google Cloud OAuth client. Modal → Google → callback → `next` works; Header shows the initial-circle.
- **Run on port 3000** for OAuth (`NEXT_PUBLIC_SITE_URL=http://localhost:3000`). Re-test sign-out by clearing the session cookie (no sign-out UI until 05).
- **All Feature-04 changes uncommitted.** Supabase project ref: **vgsiwqrovctitxkruwpj**.

## Next session starts with

1. **Commit decision (UNANSWERED).** Proposed message following the repo convention (`1.3-supabase-client-middleware-setup` = phase1/feat3): **`2.1-google-signin`** (phase2/feat1). **Never add a co-author** (global CLAUDE.md). User previously committed features himself — confirm whether to commit or he will.
2. Then **05 — Action gating, profiles & sign-out** (Phase 2). Per CLAUDE.md read `context/` first. Scope: `profiles` table + RLS + `handle_new_user` trigger on `auth.users` (inserts profile w/ full_name/avatar_url from Google metadata — no client write) via a `supabase/migrations/` SQL file; personal-page Server Components redirect to `/` when no user (proxy already gates routes from 03); **sidebar avatar + working sign-out** (`supabase.auth.signOut()` → redirect home) — this replaces/augments the Header's minimal initial-circle. Pull Supabase MCP / Context7 for the trigger + RLS. Note: full `songs`/`playlists`/etc. schema is Feature 06.

## Open questions

- Commit 04 now as `2.1-google-signin`, or user commits himself? (unanswered)
- Feature 05 builds `profiles` + `handle_new_user` trigger. Confirm whether to apply the migration via `npx supabase db push` (CLI must be linked to ref `vgsiwqrovctitxkruwpj`) or the Supabase MCP — and that adding the Google-avatar host to `next.config` `images.remotePatterns` is wanted when 05 renders the real avatar.
