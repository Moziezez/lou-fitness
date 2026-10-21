-- Admin course management: a short summary for course cards, plus insert and
-- update rights on courses for admins only. No delete: sessions and bookings
-- reference courses, so courses are taken offline by unpublishing them.

alter table public.courses
  add column summary text
    check (summary is null or char_length(summary) <= 300);

alter table public.courses
  add constraint courses_slug_format
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

grant select (summary) on public.courses to anon, authenticated;

grant insert (slug, title, summary, description, format, price_minor_units,
  currency, published)
  on public.courses to authenticated;
grant update (slug, title, summary, description, format, price_minor_units,
  currency, published)
  on public.courses to authenticated;

create policy courses_insert_admin
  on public.courses for insert to authenticated
  with check ((select private.is_admin()));

create policy courses_update_admin
  on public.courses for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
