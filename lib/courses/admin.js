import { createClient } from "@/lib/supabase/server";

/**
 * @typedef {Object} AdminCourse
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string | null} summary
 * @property {string} description
 * @property {"online_course" | "live_coaching"} format
 * @property {number} price_minor_units
 * @property {string} currency
 * @property {boolean} published
 * @property {string} updated_at
 */

const COURSE_COLUMNS =
  "id, slug, title, summary, description, format, price_minor_units, currency, published, updated_at";

// RLS lets admins read unpublished courses too; callers must run
// requireAdmin() first so non-admins never reach these.

/** @returns {Promise<AdminCourse[]>} */
export async function listCoursesForAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Kurse konnten nicht geladen werden: ${error.message}`);
  return data;
}

/** @returns {Promise<AdminCourse | null>} */
export async function getCourseForAdmin(id) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Kurs konnte nicht geladen werden: ${error.message}`);
  return data;
}
