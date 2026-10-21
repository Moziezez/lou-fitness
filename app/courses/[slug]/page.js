import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Button from "@/components/ui/Button";
import SeatCount from "@/components/ui/SeatCount";
import { formatPrice, formatSessionRange } from "@/data/sample-courses";
import { courseFormatLabel } from "@/lib/courses/formats";
import { getPublishedCourseBySlug, getPublishedCourses } from "@/lib/courses/public";
import styles from "../../pages.module.css";

// Cache Components requires at least one param. With no published courses yet,
// a placeholder keeps the build working; it renders the 404 page.
export async function generateStaticParams() {
  const courses = await getPublishedCourses();
  if (courses.length === 0) return [{ slug: "coming-soon" }];
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const course = await getPublishedCourseBySlug(slug);
  if (!course) return { title: "Course" };
  return {
    title: course.title,
    description: course.summary ?? undefined,
  };
}

export default async function CourseDetailPage({ params }) {
  const { slug } = await params;
  const course = await getPublishedCourseBySlug(slug);
  if (!course) notFound();

  const format = courseFormatLabel(course.format);
  const price = formatPrice(course.priceCents, course.currency);

  return (
    <>
      <section className={styles.pageHero}>
        <div className="container">
          <p className={styles.note}>
            <Link href="/courses">Courses</Link> / {course.title}
          </p>
          <span className={styles.badge}>{format}</span>
          <h1>{course.title}</h1>
          {course.summary ? <p className="lead">{course.summary}</p> : null}
          <p className={styles.price}>{price}</p>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.twoCol}`}>
          <div className={styles.stack}>
            <h2>About this offer</h2>
            <p>{course.description}</p>
            <h2>Fixed dates</h2>
            {course.sessions.length === 0 ? (
              <p className={styles.note}>
                Dates for this offer will be announced soon.
              </p>
            ) : (
              <ul className={styles.list}>
                {course.sessions.map((session) => (
                  <li key={session.id} className={styles.listItem}>
                    <strong>{formatSessionRange(session)}</strong>
                    <div className={styles.metaRow}>
                      {session.location ? <span>{session.location}</span> : null}
                      <SeatCount sessionId={session.id} capacity={session.capacity} />
                    </div>
                    <Button href={`/login?next=/courses/${course.slug}&session=${session.id}`}>
                      Book &amp; pay (coming soon)
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <p className={styles.note}>
              Booking and payment checkout will connect in a later milestone.
            </p>
          </div>

          <aside className={`${styles.panel} ${styles.stack}`}>
            {course.imageUrl ? (
              <div className={styles.courseImage}>
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  preload
                  sizes="(min-width: 900px) 35vw, 100vw"
                />
              </div>
            ) : null}
            <h2>Details</h2>
            <p>
              <strong>Format:</strong> {format}
            </p>
            <p>
              <strong>Price:</strong> {price}
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
