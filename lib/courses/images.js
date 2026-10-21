// Course images live in the public "course-images" Storage bucket. Safe to
// import from Client Components.
export const COURSE_IMAGE_BUCKET = "course-images";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

/**
 * Public URL for a stored course image, or null.
 * @param {string | null | undefined} path
 */
export function courseImageUrl(path) {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${COURSE_IMAGE_BUCKET}/${path}`;
}
