import Link from "next/link";
import CourseCard from "@/components/ui/CourseCard";
import { ONLINE_CLASS_FORMATS } from "@/lib/courses/formats";
import { getPublishedCourses } from "@/lib/courses/public";
import styles from "../pages.module.css";

export const metadata = {
  title: "Online access",
  description: "Courses you can join online, for example via Zoom, with fixed dates.",
};

export default async function OnlineAccessPage() {
  const courses = (await getPublishedCourses()).filter((course) =>
    ONLINE_CLASS_FORMATS.has(course.format),
  );

  return (
    <>
      <section className={styles.pageHero}>
        <div className="container">
          <span className="eyebrow">Online access</span>
          <h1>Train with Lou from anywhere</h1>
          <p className="lead">
            Courses you can join online, for example via Zoom. Pick a date that suits you.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {courses.length === 0 ? (
            <p className={styles.note}>
              New online courses are coming soon.{" "}
              <Link href="/courses">See all courses</Link>.
            </p>
          ) : (
            <>
              <div className={styles.grid}>
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
              <p className={styles.note}>
                Prefer browsing everything? <Link href="/courses">See all courses</Link>.
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
