-- Course dates: a third format ("Live + Online"), admin writes on sessions,
-- and reserved-seat counts that signed-in users can read without seeing
-- anyone else's bookings.

alter table public.courses
  drop constraint courses_format_check,
  add constraint courses_format_check
    check (format in ('online_course', 'live_coaching', 'live_online'));

-- Admins manage sessions. meeting_url stays out of the grants until there is
-- a server-side path that hands it only to confirmed participants.
grant insert (course_id, starts_at, ends_at, timezone, capacity, location,
  published)
  on public.sessions to authenticated;
grant update (starts_at, ends_at, timezone, capacity, location, published)
  on public.sessions to authenticated;
grant delete on public.sessions to authenticated;

create policy sessions_insert_admin
  on public.sessions for insert to authenticated
  with check ((select private.is_admin()));

create policy sessions_update_admin
  on public.sessions for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- Sessions with bookings can't be deleted (bookings.session_id is
-- ON DELETE RESTRICT); unpublish them instead.
create policy sessions_delete_admin
  on public.sessions for delete to authenticated
  using ((select private.is_admin()));

-- Pending bookings hold a seat until they are cancelled.
create or replace function private.reserved_seat_count(p_session_id uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer
  from public.bookings
  where session_id = p_session_id
    and status in ('pending', 'confirmed');
$$;

revoke all on function private.reserved_seat_count(uuid)
  from public, anon, authenticated;
grant execute on function private.reserved_seat_count(uuid) to authenticated;

-- security_invoker: the sessions RLS of the caller still applies, so users
-- only get counts for sessions they can already see. The count itself comes
-- from the definer helper, which exposes a number, never booking rows.
create view public.session_seats
  with (security_invoker = true)
as
  select
    s.id as session_id,
    s.capacity,
    private.reserved_seat_count(s.id) as reserved
  from public.sessions s;

revoke all on public.session_seats from public, anon, authenticated;
grant select on public.session_seats to authenticated;
