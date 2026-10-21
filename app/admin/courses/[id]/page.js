import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import CourseForm from "@/components/admin/CourseForm";
import { requireAdmin } from "@/lib/auth/session";
import { getCourseForAdmin } from "@/lib/courses/admin";
import pageStyles from "../../../pages.module.css";
import styles from "@/components/admin/admin.module.css";

export const metadata = { title: "Edit course · Admin" };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function EditCourse({ params }) {
  const { id } = await params;
  await requireAdmin(`/admin/courses/${id}`);
  if (!UUID_PATTERN.test(id)) notFound();

  const course = await getCourseForAdmin(id);
  if (!course) notFound();

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
    </>
  );
}

export default function EditCoursePage({ params }) {
  return (
    <section className="section">
      <div className="container">
        <Suspense fallback={<p className={pageStyles.note}>Loading course…</p>}>
          <EditCourse params={params} />
        </Suspense>
      </div>
    </section>
  );
}
