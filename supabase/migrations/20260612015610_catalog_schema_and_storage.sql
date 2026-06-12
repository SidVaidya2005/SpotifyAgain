-- Feature 06 — catalog schema, RLS, and Storage buckets.
--
-- The persistent foundation for the catalog: songs (with per-row public/private
-- visibility), playlists, the playlist_songs join, and liked_songs, plus the two
-- Storage buckets. Additive only — profiles + handle_new_user already exist
-- (Feature 05) and are NOT touched here.
--
-- RLS shape: songs is the only table any visitor (incl. anonymous) can read, and
-- only for public rows (plus the owner's own). Every other table is private to its
-- owner. liked_songs / playlist_songs INSERTs additionally require the referenced
-- song to be visible to the user, so a private song can't be referenced by guessing
-- its id. auth.uid() is wrapped in a subselect so Postgres evaluates it once per
-- query (RLS performance guidance), matching the profiles migration.

-- ===========================================================================
-- songs
-- ===========================================================================
create table public.songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  author text not null,
  song_path text not null,
  image_path text not null,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create index songs_user_id_idx on public.songs (user_id);

alter table public.songs enable row level security;

-- ---------------------------------------------------------------------------
-- songs RLS — readable by ANYONE (incl. anon) for public rows, plus the owner's
-- own private rows. Writes are owner-only. The SELECT policy omits a `to` clause
-- so it applies to every role (anon + authenticated); for an anonymous request
-- auth.uid() is null, so only `is_public` rows come back.
-- ---------------------------------------------------------------------------
create policy "Public songs are selectable by anyone, private only by owner"
  on public.songs
  for select
  using (is_public or (select auth.uid()) = user_id);

create policy "Users can insert their own songs"
  on public.songs
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own songs"
  on public.songs
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own songs"
  on public.songs
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ===========================================================================
-- playlists
-- ===========================================================================
create table public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  image_path text,
  created_at timestamptz not null default now()
);

create index playlists_user_id_idx on public.playlists (user_id);

alter table public.playlists enable row level security;

-- ---------------------------------------------------------------------------
-- playlists RLS — fully private: every operation is scoped to the owner.
-- ---------------------------------------------------------------------------
create policy "Users manage their own playlists"
  on public.playlists
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ===========================================================================
-- playlist_songs (join with track order)
-- ===========================================================================
create table public.playlist_songs (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists (id) on delete cascade,
  song_id uuid not null references public.songs (id) on delete cascade,
  position int not null,
  added_at timestamptz not null default now(),
  unique (playlist_id, song_id)
);

create index playlist_songs_playlist_id_idx on public.playlist_songs (playlist_id);
create index playlist_songs_song_id_idx on public.playlist_songs (song_id);

alter table public.playlist_songs enable row level security;

-- ---------------------------------------------------------------------------
-- playlist_songs RLS — a row is reachable only when its parent playlist belongs
-- to the user. INSERT additionally requires the referenced song to be visible to
-- the user (public or own), so you can't add a private song by guessing its id.
-- ---------------------------------------------------------------------------
create policy "Owners can read rows of their own playlists"
  on public.playlist_songs
  for select
  to authenticated
  using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id and p.user_id = (select auth.uid())
    )
  );

create policy "Owners can add visible songs to their own playlists"
  on public.playlist_songs
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id and p.user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.songs s
      where s.id = song_id and (s.is_public or s.user_id = (select auth.uid()))
    )
  );

create policy "Owners can update rows of their own playlists"
  on public.playlist_songs
  for update
  to authenticated
  using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id and p.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id and p.user_id = (select auth.uid())
    )
  );

create policy "Owners can delete rows of their own playlists"
  on public.playlist_songs
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id and p.user_id = (select auth.uid())
    )
  );

-- ===========================================================================
-- liked_songs
-- ===========================================================================
create table public.liked_songs (
  user_id uuid not null references auth.users (id) on delete cascade,
  song_id uuid not null references public.songs (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, song_id)
);

create index liked_songs_song_id_idx on public.liked_songs (song_id);

alter table public.liked_songs enable row level security;

-- ---------------------------------------------------------------------------
-- liked_songs RLS — private to the owner. INSERT additionally requires the liked
-- song to be visible to the user (public or own), so you can only like songs you
-- can actually see.
-- ---------------------------------------------------------------------------
create policy "Users can read their own likes"
  on public.liked_songs
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can like songs visible to them"
  on public.liked_songs
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.songs s
      where s.id = song_id and (s.is_public or s.user_id = (select auth.uid()))
    )
  );

create policy "Users can remove their own likes"
  on public.liked_songs
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ===========================================================================
-- Storage buckets — songs (audio) + images (cover art)
-- ===========================================================================
-- Both are public-read so getPublicUrl works without auth (private = unlisted via
-- RLS on the songs table, NOT access-controlled at the object level — see
-- architecture.md → File / Object Storage). on conflict keeps this idempotent.
insert into storage.buckets (id, name, public)
values
  ('songs', 'songs', true),
  ('images', 'images', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Storage RLS (on storage.objects) — public read for both buckets; insert/update/
-- delete only by the owner, whose id is the first path segment of
-- "<user_id>/<uuid>.<ext>". Downloads also work via the public object endpoint
-- regardless of the SELECT policy because the buckets are public.
-- ---------------------------------------------------------------------------
create policy "Catalog objects are publicly readable"
  on storage.objects
  for select
  using (bucket_id in ('songs', 'images'));

create policy "Users can upload to their own folder"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id in ('songs', 'images')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can update their own objects"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id in ('songs', 'images')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id in ('songs', 'images')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete their own objects"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id in ('songs', 'images')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
