-- profiles (14-day trial on Google signup) + manuscripts

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  plan text not null default 'trial' check (plan in ('trial', 'free', 'premium')),
  trial_ends_at timestamptz not null default (timezone('utc', now()) + interval '14 days'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.manuscripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default 'Sin título',
  content jsonb not null default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  source_filename text,
  word_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index manuscripts_user_id_idx on public.manuscripts (user_id);
create index manuscripts_updated_at_idx on public.manuscripts (updated_at desc);

alter table public.profiles enable row level security;
alter table public.manuscripts enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "manuscripts_select_own"
  on public.manuscripts for select
  to authenticated
  using (auth.uid() = user_id);

create policy "manuscripts_insert_own"
  on public.manuscripts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "manuscripts_update_own"
  on public.manuscripts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "manuscripts_delete_own"
  on public.manuscripts for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger manuscripts_set_updated_at
  before update on public.manuscripts
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, plan, trial_ends_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    'trial',
    timezone('utc', now()) + interval '14 days'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.manuscripts to authenticated;
