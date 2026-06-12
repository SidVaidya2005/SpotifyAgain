-- Feature 05 — profiles table, RLS, and the handle_new_user trigger.
--
-- profiles mirrors auth.users with the user's Google display name + avatar so the
-- app can render identity without reading auth.users directly. Rows are created
-- automatically by the handle_new_user trigger on sign-up — never by the client.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ---------------------------------------------------------------------------
-- RLS — owner-only (this project keeps profiles private, unlike the public-read
-- examples in the Supabase quickstart). No INSERT policy: the only writer is the
-- security-definer trigger below, which bypasses RLS. auth.uid() is wrapped in a
-- subselect so Postgres evaluates it once per query (RLS performance guidance).
-- ---------------------------------------------------------------------------
create policy "Profiles are selectable by the owner"
  on public.profiles
  for select
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ---------------------------------------------------------------------------
-- Trigger — create a profile row on every new auth user.
-- security definer + empty search_path is the Supabase-recommended form; tables
-- are fully qualified because search_path is empty. on conflict keeps it
-- idempotent so a re-run / re-signup can't error on a pre-existing row.
-- ---------------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Backfill — users who signed in before this trigger existed (e.g. during the
-- Feature 04 OAuth test) have no profile yet. Idempotent.
-- ---------------------------------------------------------------------------
insert into public.profiles (id, full_name, avatar_url)
select
  u.id,
  u.raw_user_meta_data ->> 'full_name',
  u.raw_user_meta_data ->> 'avatar_url'
from auth.users u
on conflict (id) do nothing;
