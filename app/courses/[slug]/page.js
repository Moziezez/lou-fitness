import Link from "next/link";
import { notFound } from "next/navigation";
import Button from "@/components/ui/Button";
import {
  formatPrice,
  formatSessionRange,
  getCourseBySlug,
  getPublishedCourses,
  seatsLeft,
} from "@/data/sample-courses";
import styles from "../../pages.module.css";

export function generateStaticParams() {
  return getPublishedCourses().map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return { title: "Course" };
  return {
    title: course.title,
    description: course.summary,
  };
}

export default async function CourseDetailPage({ params }) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  return (
    <>
      <section className={styles.pageHero}>
        <div className="container">
          <p className={styles.note}>
            <Link href="/courses">Courses</Link> / {course.title}
          </p>
          <span className={styles.badge}>{course.format}</span>
          <h1>{course.title}</h1>
          <p className="lead">{course.summary}</p>
          <p className={styles.price}>{formatPrice(course.priceCents, course.currency)}</p>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.twoCol}`}>
          <div className={styles.stack}>
            <h2>About this offer</h2>
            <p>{course.description}</p>
            <h2>Fixed dates</h2>
            <ul className={styles.list}>
              {course.sessions.map((session) => {
                const left = seatsLeft(session);
                return (
                  <li key={session.id} className={styles.listItem}>
                    <strong>{formatSessionRange(session)}</strong>
                    <div className={styles.metaRow}>
                      <span>{session.location}</span>
                      <span>
                        {left > 0 ? `${left} seat${left === 1 ? "" : "s"} left` : "Full (example)"}
                      </span>
                    </div>
                    {left > 0 ? (
                      <Button href={`/login?next=/courses/${course.slug}&session=${session.id}`}>
                        Book &amp; pay (coming soon)
                      </Button>
                    ) : (
                      <span className={styles.note}>Unavailable for this example slot.</span>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className={styles.note}>
              Booking and payment checkout will connect in a later milestone. Auth
              and provider credentials are required first.
            </p>
          </div>

          <aside className={styles.panel}>
            <h2>Details</h2>
            <p>
              <strong>Format:</strong> {course.format}
            </p>
            <p>
              <strong>Price:</strong> {formatPrice(course.priceCents, course.currency)}
            </p>
            <p>
              <strong>Timezone:</strong> stored per session (America/Jamaica in samples)
            </p>
            <p className={styles.note}>Example data only.</p>
          </aside>
        </div>
      </section>
    </>
  );
}
