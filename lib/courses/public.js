import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * @typedef {Object} PublicSession
 * @property {string} id
 * @property {string} startsAt
 * @property {string} endsAt
 * @property {string} timezone
 * @property {number | null} capacity
 * @property {string | null} location
 */

/**
 * Same field names as data/sample-courses.js so the shared UI works with both.
 * @typedef {Object} PublicCourse
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string | null} summary
 * @property {string} description
 * @property {"online_course" | "live_coaching"} format
 * @property {number} priceCents
 * @property {string} currency
 * @property {PublicSession[]} sessions Upcoming published sessions, soonest first.
 */

// Invalidated by saveCourse() so admin edits show up right away.
export const COURSES_TAG = "courses";

const COURSE_COLUMNS =
  "id, slug, title, summary, description, format, price_minor_units, currency, " +
  "sessions (id, starts_at, ends_at, timezone, capacity, location)";

/** @returns {PublicCourse} */
function toPublicCourse(row) {
  const now = Date.now();
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    description: row.description,
    format: row.format,
    priceCents: row.price_minor_units,
    currency: row.currency,
    sessions: row.sessions
      .filter((session) => new Date(session.ends_at).getTime() > now)
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
      .map((session) => ({
        id: session.id,
        startsAt: session.starts_at,
        endsAt: session.ends_at,
        timezone: session.timezone,
        capacity: session.capacity,
        location: session.location,
      })),
  };
}

// RLS limits anon to published courses and sessions; the explicit filter
// keeps that true even if the policies change.

/** @returns {Promise<PublicCourse[]>} */
export async function getPublishedCourses() {
  "use cache";
  cacheLife("hours");
  cacheTag(COURSES_TAG);

  const { data, error } = await createPublicClient()
    .from("courses")
    .select(COURSE_COLUMNS)
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Kurse konnten nicht geladen werden: ${error.message}`);
  return data.map(toPublicCourse);
}

/** @returns {Promise<PublicCourse | null>} */
export async function getPublishedCourseBySlug(slug) {
  "use cache";
  cacheLife("hours");
  cacheTag(COURSES_TAG);

  const { data, error } = await createPublicClient()
    .from("courses")
    .select(COURSE_COLUMNS)
    .eq("published", true)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Kurs konnte nicht geladen werden: ${error.message}`);
  return data ? toPublicCourse(data) : null;
}
