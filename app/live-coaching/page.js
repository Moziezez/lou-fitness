import Link from "next/link";
import Button from "@/components/ui/Button";
import {
  formatPrice,
  formatSessionRange,
  getLiveCoachingCourses,
  seatsLeft,
} from "@/data/sample-courses";
import styles from "../pages.module.css";

export const metadata = {
  title: "Live coaching",
  description: "Book example live coaching sessions with fixed dates.",
};

export default function LiveCoachingPage() {
  const courses = getLiveCoachingCourses();

  return (
    <>
      <section className={styles.pageHero}>
        <div className="container">
          <span className="eyebrow">Live coaching</span>
          <h1>Fixed appointments, personal focus</h1>
          <p className="lead">
            Example one-to-one sessions. Choose a published date — no dynamic
            calendar booking yet.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {courses.map((course) => (
            <div key={course.id} className={styles.stack} style={{ marginBottom: "3rem" }}>
              <div>
                <h2>{course.title}</h2>
                <p>{course.description}</p>
                <p className={styles.price}>{formatPrice(course.priceCents, course.currency)}</p>
              </div>
              <ul className={styles.list}>
                {course.sessions.map((session) => {
                  const left = seatsLeft(session);
                  return (
                    <li key={session.id} className={styles.listItem}>
                      <strong>{formatSessionRange(session)}</strong>
                      <div className={styles.metaRow}>
                        <span>{session.location}</span>
                        <span>{left > 0 ? "Available" : "Booked (example)"}</span>
                      </div>
                      {left > 0 ? (
                        <Button href={`/courses/${course.slug}`}>View &amp; continue</Button>
                      ) : (
                        <span className={styles.note}>No seats left for this example slot.</span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className={styles.note}>
                Prefer browsing everything?{" "}
                <Link href="/courses">See all courses</Link>.
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
