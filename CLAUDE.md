# SpotifyAgain

A full-stack Spotify clone and portfolio piece: anyone can browse and stream public tracks without an account, while signing in with Google unlocks uploading songs (public or private), liking, and playlists — all behind a persistent player with search and a personal library. Built to deploy on Render.

## Project context lives in `context/`

The `context/` folder is the source of truth for this project. **Read it before
writing any code**, and keep it current as you work. Read in this order:

1. **`context/project-overview.md`** — what the product is, who it's for, what's in and out of scope.
2. **`context/architecture.md`** — stack, folder structure, system boundaries, data model, and the **invariants you must never violate**.
3. **`context/code-standards.md`** — the rules every change must follow.
4. **`context/DESIGN-spotify.md`** — the visual & UI source of truth (brand, color, layout, components, states).
5. **`context/library-docs.md`** — project-specific usage patterns for each library (read the relevant section before using one).
6. **`context/build-plan.md`** — the ordered phases and features to build.
7. **`context/progress-tracker.md`** — what's done, in progress, and next.

## Standing rules

- **Read `context/` first.** Never assume — verify against `project-overview.md` and `architecture.md`.
- **Obey the invariants** in `architecture.md`. They are non-negotiable.
- **Follow `code-standards.md`** on every change.
- **Follow `DESIGN-spotify.md`** for every UI/visual decision — never invent visual design.
- **For libraries**, pull live docs from the **Context7 MCP** first (resolve the library id, then query its docs), then follow the authority order in `library-docs.md`: Context7 / MCP servers → skills / `CLAUDE.md` → `library-docs.md` → general knowledge.
- **Stay in scope.** Build only what the current feature in `build-plan.md` requires.
- **Update `progress-tracker.md`** after every completed feature — check the box, set current status, and append any non-obvious decisions.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start the Next.js dev server at http://localhost:3000
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint
- `npx supabase db push` — apply SQL migrations in `supabase/migrations/` to the linked project

Targets **Render** for deployment as a Node Web Service (build `npm install && npm run build`, start `npm run start`, binds to `PORT`) — not yet deployed; live build status is in `context/progress-tracker.md`. See `context/architecture.md` → Deployment.

## Tooling (MCP)

- **Context7** (`plugin:context7:context7`) — live, version-specific library docs. Resolve the library id, then query its docs (tool names vary by client: `resolve-library-id`/`query-docs` or `resolve_library_id`/`query_docs`) before writing code against Next.js 15, Tailwind v4, `@supabase/ssr`, React Query v5, and any other library whose API you're unsure of.
- **Supabase** (`plugin:supabase:supabase`) — project database/schema/RLS operations and Supabase-specific guidance (authenticate once before use).
