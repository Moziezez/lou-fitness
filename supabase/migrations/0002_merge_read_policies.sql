-- Merge the per-table "own/published" and "admin" SELECT policies into one
-- policy each. Same access as 0001; Postgres evaluates one policy instead of
-- two permissive ones (Supabase advisor 0006_multiple_permissive_policies).

drop policy profiles_read_own on public.profiles;
drop policy profiles_read_admin on public.profiles;
create policy profiles_read
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));

drop policy courses_read_published on public.courses;
drop policy courses_read_admin on public.courses;
create policy courses_read_published
  on public.courses for select to anon
  using (published);
create policy courses_read
  on public.courses for select to authenticated
  using (published or (select private.is_admin()));

drop policy sessions_read_published on public.sessions;
drop policy sessions_read_admin on public.sessions;
create policy sessions_read_published
  on public.sessions for select to anon
  using (
    published
    and exists (
      select 1
      from public.courses
      where courses.id = sessions.course_id
        and courses.published
    )
  );
create policy sessions_read
  on public.sessions for select to authenticated
  using (
    (
      published
      and exists (
        select 1
        from public.courses
        where courses.id = sessions.course_id
          and courses.published
      )
    )
    or (select private.is_admin())
  );

drop policy bookings_read_own on public.bookings;
drop policy bookings_read_admin on public.bookings;
create policy bookings_read
  on public.bookings for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
