import Link from "next/link";
import { formatPrice } from "@/data/sample-courses";
import styles from "./CourseCard.module.css";

const formatLabels = {
  online: "Online course",
  live: "Live coaching",
  group: "Group session",
};

export default function CourseCard({ course }) {
  return (
    <article className={styles.card}>
      <div className={styles.media} aria-hidden="true" />
      <div>
        <span className={styles.format}>{formatLabels[course.format] || course.format}</span>
        <h3 className={styles.title}>
          <Link href={`/courses/${course.slug}`}>{course.title}</Link>
        </h3>
      </div>
      <p className={styles.summary}>{course.summary}</p>
      <div className={styles.meta}>
        <span className={styles.price}>{formatPrice(course.priceCents, course.currency)}</span>
        <span className={styles.sessions}>
          {course.sessions.length} fixed{" "}
          {course.sessions.length === 1 ? "date" : "dates"}
        </span>
      </div>
    </article>
  );
}
