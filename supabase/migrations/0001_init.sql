-- Lou Fitness schema for Supabase.
-- Read-only RLS policies are intentional. Add write access only with
-- server-verified authorization and any required transactional safeguards.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'customer'
    check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  format text not null
    check (format in ('online_course', 'live_coaching')),
  price_minor_units bigint not null check (price_minor_units >= 0),
  currency text not null default 'USD'
    check (currency ~ '^[A-Z]{3}$'),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null,
  capacity integer check (capacity is null or capacity > 0),
  location text,
  meeting_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (location is null or meeting_url is null),
  check (meeting_url is null or meeting_url ~ '^https://')
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_id uuid not null references public.sessions (id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (user_id, session_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  provider text not null check (provider in ('test', 'paynowpro', 'fygaro')),
  external_reference text,
  amount_minor_units bigint not null check (amount_minor_units >= 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  status text not null default 'pending'
    check (status in ('pending', 'succeeded', 'failed', 'simulated', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (external_reference is null or length(trim(external_reference)) > 0)
);

create index if not exists sessions_course_id_idx
  on public.sessions (course_id);
create index if not exists sessions_starts_at_idx
  on public.sessions (starts_at);
create index if not exists bookings_user_id_idx
  on public.bookings (user_id);
create index if not exists bookings_session_id_idx
  on public.bookings (session_id);
create index if not exists payments_booking_id_idx
  on public.payments (booking_id);
create unique index if not exists payments_provider_reference_uidx
  on public.payments (provider, external_reference)
  where external_reference is not null;

-- Helpers live in a schema that is not exposed through the Data API, so
-- SECURITY DEFINER functions cannot be called as RPC endpoints.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public, anon, authenticated;
grant execute on function private.is_admin() to authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();
create trigger courses_set_updated_at
  before update on public.courses
  for each row execute function private.set_updated_at();
create trigger sessions_set_updated_at
  before update on public.sessions
  for each row execute function private.set_updated_at();
create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function private.set_updated_at();

-- Every new auth user gets a customer profile. full_name comes from
-- user-editable metadata and is display-only; role is never taken from it.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''));
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.sessions enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;

create policy profiles_read_own
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_read_admin
  on public.profiles for select to authenticated
  using ((select private.is_admin()));

create policy courses_read_published
  on public.courses for select to anon, authenticated
  using (published);
create policy courses_read_admin
  on public.courses for select to authenticated
  using ((select private.is_admin()));

create policy sessions_read_published
  on public.sessions for select to anon, authenticated
  using (
    published
    and exists (
      select 1
      from public.courses
      where courses.id = sessions.course_id
        and courses.published
    )
  );
create policy sessions_read_admin
  on public.sessions for select to authenticated
  using ((select private.is_admin()));

create policy bookings_read_own
  on public.bookings for select to authenticated
  using (user_id = (select auth.uid()));
create policy bookings_read_admin
  on public.bookings for select to authenticated
  using ((select private.is_admin()));

create policy payments_read_admin
  on public.payments for select to authenticated
  using ((select private.is_admin()));

grant usage on schema public to anon, authenticated;
revoke all on public.profiles, public.courses, public.sessions,
  public.bookings, public.payments from anon, authenticated;

grant select (id, full_name, role, created_at, updated_at)
  on public.profiles to authenticated;
grant select (id, slug, title, description, format, price_minor_units,
  currency, published, created_at, updated_at)
  on public.courses to anon, authenticated;
grant select (id, course_id, starts_at, ends_at, timezone, capacity,
  location, published, created_at, updated_at)
  on public.sessions to anon, authenticated;
grant select (id, user_id, session_id, status, created_at)
  on public.bookings to authenticated;
grant select (id, booking_id, provider, external_reference,
  amount_minor_units, currency, status, created_at, updated_at)
  on public.payments to authenticated;

-- Meeting links are deliberately not readable by anon/authenticated clients.
-- Grant access only to trusted server-side code after authorization is added.
