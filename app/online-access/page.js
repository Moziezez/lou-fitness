import Link from "next/link";
import Button from "@/components/ui/Button";
import SeatCount from "@/components/ui/SeatCount";
import { formatPrice, formatSessionRange } from "@/data/sample-courses";
import { courseFormatLabel, ONLINE_CLASS_FORMATS } from "@/lib/courses/formats";
import { getPublishedCourses } from "@/lib/courses/public";
import styles from "../pages.module.css";

export const metadata = {
  title: "Live coaching",
  description: "Book online classes and live coaching sessions with fixed dates.",
};

export default async function LiveCoachingPage() {
  const courses = (await getPublishedCourses()).filter((course) =>
    ONLINE_CLASS_FORMATS.has(course.format),
  );

  return (
    <>
      <section className={styles.pageHero}>
        <div className="container">
          <span className="eyebrow">Live coaching</span>
          <h1>Fixed appointments, personal focus</h1>
          <p className="lead">
            Online classes with fixed dates. Pick a date that suits you.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {courses.length === 0 ? (
            <p className={styles.note}>
              New online classes are coming soon.{" "}
              <Link href="/courses">See all courses</Link>.
            </p>
          ) : null}
          {courses.map((course) => (
            <div key={course.id} className={styles.stack} style={{ marginBottom: "3rem" }}>
              <div>
                <span className={styles.badge}>{courseFormatLabel(course.format)}</span>
                <h2>
                  <Link href={`/courses/${course.slug}`}>{course.title}</Link>
                </h2>
                <p>{course.summary ?? course.description}</p>
                <p className={styles.price}>{formatPrice(course.priceCents, course.currency)}</p>
              </div>
              {course.sessions.length === 0 ? (
                <p className={styles.note}>Dates for this class will be announced soon.</p>
              ) : (
                <ul className={styles.list}>
                  {course.sessions.map((session) => (
                    <li key={session.id} className={styles.listItem}>
                      <strong>{formatSessionRange(session)}</strong>
                      <div className={styles.metaRow}>
                        {session.location ? <span>{session.location}</span> : null}
                        <SeatCount sessionId={session.id} capacity={session.capacity} />
                      </div>
                      <Button href={`/courses/${course.slug}`}>View &amp; continue</Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {courses.length > 0 ? (
            <p className={styles.note}>
              Prefer browsing everything? <Link href="/courses">See all courses</Link>.
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}
