-- Lou Fitness initial schema (draft for milestone 2).
-- Apply in Supabase SQL editor or via CLI after project creation.
-- Do not treat as live until RLS policies are reviewed.

-- roles: customer | admin (stored on profiles; never trust client claims alone)

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  summary text,
  format text not null check (format in ('online', 'live', 'group')),
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'USD',
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
  location text,
  meeting_url text,
  capacity integer not null check (capacity > 0),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id),
  session_id uuid not null references public.sessions (id),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'expired', 'failed')),
  price_cents integer not null check (price_cents >= 0),
  currency text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, session_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  provider text not null check (provider in ('test', 'paynowpro', 'fygaro')),
  provider_payment_id text,
  status text not null default 'pending'
    check (status in ('pending', 'succeeded', 'failed', 'simulated', 'refunded')),
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null,
  raw_event jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sessions_course_id_idx on public.sessions (course_id);
create index if not exists sessions_starts_at_idx on public.sessions (starts_at);
create index if not exists bookings_user_id_idx on public.bookings (user_id);
create index if not exists bookings_session_id_idx on public.bookings (session_id);
create index if not exists payments_booking_id_idx on public.payments (booking_id);
create unique index if not exists payments_provider_payment_id_uidx
  on public.payments (provider, provider_payment_id)
  where provider_payment_id is not null;

-- RLS enablement (policies fleshed out in milestone 2)
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.sessions enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
