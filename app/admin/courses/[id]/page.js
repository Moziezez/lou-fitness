import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import FormMessage from "@/components/auth/FormMessage";
import CourseForm from "@/components/admin/CourseForm";
import SessionForm from "@/components/admin/SessionForm";
import { requireAdmin } from "@/lib/auth/session";
import { getCourseForAdmin, listSessionsForAdmin } from "@/lib/courses/admin";
import { toLocalInput } from "@/lib/courses/time";
import pageStyles from "../../../pages.module.css";
import styles from "@/components/admin/admin.module.css";

export const metadata = { title: "Edit course · Admin" };

const SAVED_MESSAGES = {
  created: "Course created. Add its dates below.",
  "date-added": "Date added.",
  "date-updated": "Date saved.",
  "date-deleted": "Date deleted.",
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function EditCourse({ params, searchParams }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  await requireAdmin(`/admin/courses/${id}`);
  if (!UUID_PATTERN.test(id)) notFound();

  const [course, sessions] = await Promise.all([
    getCourseForAdmin(id),
    listSessionsForAdmin(id),
  ]);
  if (!course) notFound();
  const saved = typeof query.saved === "string" ? SAVED_MESSAGES[query.saved] : null;

  return (
    <>
      <div className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>
            <Link href="/admin">Admin</Link> / <Link href="/admin/courses">Courses</Link> / Edit
          </p>
          <h1>{course.title}</h1>
        </div>
      </div>
      <div className={`${pageStyles.panel} ${styles.formPanel}`}>
        <CourseForm course={course} />
      </div>

      <div id="dates" className={styles.dates}>
        <h2>Dates</h2>
        {saved ? <FormMessage message={saved} /> : null}
        <p className={pageStyles.note}>
          Times are Kingston time (America/Jamaica). Signed-in visitors see the
          reserved seats as “x/max”.
        </p>
        {sessions.map((session) => (
          <SessionForm
            key={`${session.id}-${session.starts_at}-${session.capacity}-${session.published}`}
            courseId={course.id}
            session={{
              id: session.id,
              startsAt: toLocalInput(session.starts_at, session.timezone),
              endsAt: toLocalInput(session.ends_at, session.timezone),
              location: session.location,
              capacity: session.capacity,
              published: session.published,
              reserved: session.reserved,
            }}
          />
        ))}
        <SessionForm key={`new-${sessions.length}`} courseId={course.id} />
      </div>
    </>
  );
}

export default function EditCoursePage({ params, searchParams }) {
  return (
    <section className="section">
      <div className="container">
        <Suspense fallback={<p className={pageStyles.note}>Loading course…</p>}>
          <EditCourse params={params} searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}
