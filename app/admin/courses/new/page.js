import { Suspense } from "react";
import Link from "next/link";
import CourseForm from "@/components/admin/CourseForm";
import { requireAdmin } from "@/lib/auth/session";
import pageStyles from "../../../pages.module.css";
import styles from "@/components/admin/admin.module.css";

export const metadata = { title: "New course · Admin" };

async function NewCourse() {
  await requireAdmin("/admin/courses/new");
  return <CourseForm />;
}

export default function NewCoursePage() {
  return (
    <section className="section">
      <div className="container">
        <div className={styles.header}>
          <div>
            <p className={styles.breadcrumb}>
              <Link href="/admin">Admin</Link> / <Link href="/admin/courses">Courses</Link> / New
            </p>
            <h1>New course</h1>
          </div>
        </div>
        <div className={`${pageStyles.panel} ${styles.formPanel}`}>
          <Suspense fallback={<p className={pageStyles.note}>Checking access…</p>}>
            <NewCourse />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
