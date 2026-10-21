-- Course images: a public Storage bucket that only admins can write to, and
-- the object path on the course row.

alter table public.courses
  add column image_path text
    check (image_path is null or image_path ~ '^[a-z0-9-]+\.(jpg|png|webp)$');

grant select (image_path) on public.courses to anon, authenticated;
grant insert (image_path), update (image_path)
  on public.courses to authenticated;

-- Public bucket: images are served from the public object URL without
-- policies. Size and type limits are enforced by Storage as a second check
-- after the server action.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'course-images',
  'course-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
);

-- Listing, uploading and deleting are admin-only. SELECT is needed for
-- remove() and so admins can list; public reads go through the public URL.
create policy course_images_select_admin
  on storage.objects for select to authenticated
  using (bucket_id = 'course-images' and (select private.is_admin()));

create policy course_images_insert_admin
  on storage.objects for insert to authenticated
  with check (bucket_id = 'course-images' and (select private.is_admin()));

create policy course_images_update_admin
  on storage.objects for update to authenticated
  using (bucket_id = 'course-images' and (select private.is_admin()))
  with check (bucket_id = 'course-images' and (select private.is_admin()));

create policy course_images_delete_admin
  on storage.objects for delete to authenticated
  using (bucket_id = 'course-images' and (select private.is_admin()));
