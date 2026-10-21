import { createClient } from "@/lib/supabase/server";

/**
 * @typedef {Object} AdminCourse
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string | null} summary
 * @property {string} description
 * @property {"online_course" | "live_coaching" | "live_online"} format
 * @property {number} price_minor_units
 * @property {string} currency
 * @property {boolean} published
 * @property {string | null} image_path Object path in the course-images bucket.
 * @property {string} updated_at
 */

const COURSE_COLUMNS =
  "id, slug, title, summary, description, format, price_minor_units, currency, published, image_path, updated_at";

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

/**
 * @typedef {Object} AdminSession
 * @property {string} id
 * @property {string} starts_at
 * @property {string} ends_at
 * @property {string} timezone
 * @property {number | null} capacity
 * @property {string | null} location
 * @property {boolean} published
 * @property {number} reserved Pending and confirmed bookings.
 */

/** @returns {Promise<AdminSession[]>} */
export async function listSessionsForAdmin(courseId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("id, starts_at, ends_at, timezone, capacity, location, published")
    .eq("course_id", courseId)
    .order("starts_at");
  if (error) throw new Error(`Termine konnten nicht geladen werden: ${error.message}`);
  if (data.length === 0) return [];

  const { data: seats, error: seatsError } = await supabase
    .from("session_seats")
    .select("session_id, reserved")
    .in(
      "session_id",
      data.map((session) => session.id),
    );
  if (seatsError) throw new Error(`Plätze konnten nicht geladen werden: ${seatsError.message}`);
  const reserved = new Map(seats.map((row) => [row.session_id, row.reserved]));
  return data.map((session) => ({ ...session, reserved: reserved.get(session.id) ?? 0 }));
}
