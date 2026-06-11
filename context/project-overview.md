# Project Overview

> **Role:** Product source of truth — what this product is, who it's for, what's in and out of scope.
> **Read first**, before any other context file.
> **Relates to:** scope drives `build-plan.md`; progress tracked in `progress-tracker.md`.

## About the Project

SpotifyAgain is a full-stack music streaming web app — a Spotify clone, built as
a **portfolio piece** to demonstrate end-to-end product engineering. Anyone can
land on the site, browse the public catalog, search, and stream songs through a
persistent bottom player **without creating an account**. Signing in with Google
unlocks the creator features: uploading audio tracks (with cover art and
metadata, marked **public or private**), liking songs, and organizing tracks
into playlists and a personal library. Each uploader controls whether a song is
visible to everyone or only to themselves.

## The Problem It Solves

Building a real streaming product touches every hard part of full-stack work at
once: authenticated file uploads, blob storage, a global audio player that
survives navigation, row-level data ownership, per-row visibility, and search.
SpotifyAgain is a focused, end-to-end reference build that exercises all of these
with a familiar product so the patterns are clear rather than abstract. As a
portfolio piece it also has to make a strong first impression in seconds: a
recruiter or hiring manager can open the live site and play music immediately,
with no signup wall, then see the depth (auth, uploads, playlists) on demand.

## Pages

- **Home (`/`)** — landing grid of recently uploaded public songs and shortcuts; the default view for everyone, signed in or not.
- **Search (`/search`)** — debounced search across public songs by title and author, with playable results; open to everyone.
- **Liked Songs (`/liked`)** — the signed-in user's liked tracks as a playable list; **requires sign-in**.
- **Library (`/library`)** — songs the current user has uploaded (public and private), plus the upload entry point; **requires sign-in**.
- **Playlist (`/playlist/[id]`)** — a single playlist's tracks with add/remove/reorder controls; **owner only**.
- **Auth callback (`/auth/callback`)** — OAuth code-exchange route; not a user-facing page.

The persistent **player bar** and **sidebar** are part of the app shell and
appear on every page, signed in or not.

## Navigation

The left **sidebar** is the primary navigation: Home, Search, and (when signed
in) the user's Library / playlists. The **player bar** is pinned to the bottom of
every page and never unmounts during navigation, so playback continues as the
user moves around. An unauthenticated visitor can browse Home and Search and play
any public song freely; the app only prompts Google sign-in when they try a
protected action (upload, like, create playlist) or open a personal page (Liked
Songs, Library, a playlist). After signing in they return to where they were.

## Core User Flow

### Browse without an account

A first-time visitor lands on Home, sees a grid of public songs, can search, and
clicks any track to start playback in the bottom player — no account required.
This is the recruiter's first impression.

### Sign in

When the visitor wants to upload, like, or make a playlist, they click "Continue
with Google", complete Google OAuth, and are redirected back through
`/auth/callback`, which exchanges the code for a session. A `profiles` row is
ensured for the user, and they return to the action they were attempting.

### Upload a song

From the Library, the signed-in user opens the upload modal, picks an MP3 file
and a cover image, enters a title and author, and chooses whether the song is
**public** (visible to everyone) or **private** (only them). The files upload to
Supabase Storage and a `songs` row is inserted with the chosen visibility. A
public song appears in everyone's home grid and search; a private one appears
only in the uploader's library.

### Play

The user clicks any song they can see. It becomes the active track in the player
store, the bottom player loads the audio from Storage, and playback starts. They
can pause/seek/adjust volume and skip to the next/previous track in the active
queue — all without leaving the page.

### Organize

The signed-in user likes songs (toggling a heart) and creates playlists, adding
tracks to them and reordering. Liked Songs and each playlist are playable lists
scoped to that user.

### Find

From Search, anyone types a query; results filter by song title and author after
a short debounce. Any visible result can be played; signed-in users can also add
it to a playlist.

## Data Architecture

### Identity

Supabase Auth owns user accounts (Google OAuth). A `profiles` row mirrors each
auth user with display name and avatar for rendering.

### Catalog

`songs` holds uploaded tracks: title, author, the Storage paths for the audio
file and cover image, the uploader's `user_id`, and an `is_public` flag. Public
songs form a shared, searchable catalog readable by **anyone — signed in or
not**; private songs are visible only to their uploader.

### Collections

`playlists`, the `playlist_songs` join (with track order), and `liked_songs`
capture each signed-in user's private organization of the catalog.

## Features In Scope

- Anonymous browsing & playback: explore and stream public songs with no account.
- Google OAuth sign-in / sign-out; browsing and playback are open to everyone, creator actions require a session.
- Upload songs: MP3 + cover image + title/author + **public/private visibility** → Supabase Storage + `songs` row.
- Per-song visibility: each uploader marks a song public (everyone) or private (only them).
- Persistent bottom player: play/pause, seek, volume, next/previous.
- Play queue derived from the list a song was launched from.
- Like / unlike songs and a Liked Songs page (signed in).
- Personal Library page of the user's uploaded songs (signed in).
- Playlists: create, rename, delete; add/remove/reorder tracks; playlist detail page (signed in).
- Search public songs by title and author with debounced results.
- Responsive layout with sidebar + player shell, per `DESIGN-spotify.md`.
- Deployable to Render as a Node Web Service (live at a public URL once shipped).

## Features Out of Scope

- Payments, premium tiers, or any Stripe/subscription billing.
- Social features: following users, sharing, collaborative playlists, comments.
- Recommendations, "made for you", radio, or any algorithmic feeds.
- Email/password or non-Google login providers.
- Native mobile apps; this is a responsive web app only.
- Lyrics, podcasts, video, audio transcoding, or server-side media processing.
- Real-time presence ("friend activity") and cross-device playback handoff.
- Signed-URL truly-private audio streaming — here "private" means *unlisted* (hidden from the catalog by RLS), not access-controlled: the audio object sits in a public-read bucket, so anyone who obtains the URL can still stream it.

## Target User

Primary audience: **recruiters, hiring managers, and engineers** evaluating this
as a portfolio project — they should grasp the product and see it working within
seconds, without signing up. Secondary: end users who want a simple space to
upload and stream their own audio. Assumes a modern desktop or mobile browser.

## Success Criteria

- A logged-out visitor (e.g. a recruiter) can open the deployed Render URL, browse public songs, and play one with no account.
- A new user can sign in with Google and reach Home with a valid session.
- A signed-in user can upload an MP3 + cover, choose public/private, and see the song appear immediately in their library.
- A song marked private does not appear in any other user's home, search, or library.
- Clicking any visible song starts playback in the persistent player and survives navigation between pages.
- Play/pause, seek, volume, and next/previous all work against real uploaded audio.
- Liking a song updates the Liked Songs page; unliking removes it.
- A user can create a playlist, add/remove/reorder tracks, and play it back in order.
- Search returns matching public songs by title/author as the user types.
- The UI is responsive and usable on phone, tablet/iPad (portrait and landscape), and desktop — the sidebar collapses to a bottom nav on small screens, the song grid reflows, and the player bar stays accessible at every size.
- Every data read returns only rows the viewer is permitted to see — public songs to everyone, private songs and all collections to their owner — enforced by RLS.
- The app is deployed and reachable at a public Render URL, with OAuth working in production.
