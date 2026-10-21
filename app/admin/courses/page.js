import { Suspense } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import FormMessage from "@/components/auth/FormMessage";
import { requireAdmin } from "@/lib/auth/session";
import { listCoursesForAdmin } from "@/lib/courses/admin";
import { courseFormatLabel } from "@/lib/courses/formats";
import { formatPrice } from "@/data/sample-courses";
import pageStyles from "../../pages.module.css";
import styles from "@/components/admin/admin.module.css";

export const metadata = { title: "Courses · Admin" };

const dateFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "America/Jamaica",
});

async function CourseList({ searchParams }) {
  await requireAdmin("/admin/courses");
  const [courses, params] = await Promise.all([listCoursesForAdmin(), searchParams]);
  const saved = typeof params.saved === "string" ? params.saved : null;

  return (
    <div className={styles.list}>
      {saved ? <FormMessage message={`Saved “${saved}”.`} /> : null}

      {courses.length === 0 ? (
        <div className={`${styles.tableWrap} ${styles.empty}`}>
          <p>No courses yet.</p>
          <p className={pageStyles.note}>Create your first course to get started.</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Course</th>
                <th scope="col">Format</th>
                <th scope="col">Price</th>
                <th scope="col">Status</th>
                <th scope="col">Updated</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>
                    <Link href={`/admin/courses/${course.id}`}>{course.title}</Link>
                    <span className={styles.slug}>/courses/{course.slug}</span>
                  </td>
                  <td>{courseFormatLabel(course.format)}</td>
                  <td>{formatPrice(course.price_minor_units, course.currency)}</td>
                  <td>
                    {course.published ? (
                      <span className={pageStyles.badge}>Published</span>
                    ) : (
                      <span className={styles.draft}>Draft</span>
                    )}
                  </td>
                  <td>{dateFormat.format(new Date(course.updated_at))}</td>
                  <td>
                    <Link href={`/admin/courses/${course.id}`}>Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminCoursesPage({ searchParams }) {
  return (
    <section className="section">
      <div className="container">
        <div className={styles.header}>
          <div>
            <p className={styles.breadcrumb}>
              <Link href="/admin">Admin</Link> / Courses
            </p>
            <h1>Courses</h1>
          </div>
          <Button href="/admin/courses/new">New course</Button>
        </div>
        <Suspense fallback={<p className={pageStyles.note}>Loading courses…</p>}>
          <CourseList searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}
