import Button from "@/components/ui/Button";
import CourseCard from "@/components/ui/CourseCard";
import { getPublishedCourses } from "@/data/sample-courses";
import styles from "./page.module.css";

export default function HomePage() {
  const featured = getPublishedCourses().slice(0, 3);

  return (
    <>
      <section className={styles.hero} aria-label="Welcome">
        <div className={styles.heroMedia} aria-hidden="true" />
        <div className={styles.heroContent}>
          <h1 className={styles.brand}>Lou Fitness</h1>
          <p className={styles.headline}>Get in shape with a smile.</p>
          <p className={styles.support}>
            Personal coaching with Lou Shine in Kingston, Jamaica — Cherry Gardens.
            Weekly routines, online courses, and live sessions with fixed dates.
          </p>
          <div className={styles.ctaRow}>
            <Button href="/courses">Browse courses</Button>
            <Button href="/live-coaching" variant="secondary">
              Book live coaching
            </Button>
          </div>
        </div>
      </section>

      <section className={`section ${styles.philosophy}`}>
        <div className={`container ${styles.philosophyInner}`}>
          <p className={styles.philosophyQuote}>
            Start your weekly fitness routine — and keep showing up for yourself.
          </p>
          <div className={styles.philosophyMeta}>
            <span className="eyebrow">Philosophy</span>
            <p>
              Example copy: movement should feel welcoming. Lou focuses on steady
              habits, clear guidance, and sessions you can look forward to —
              outdoors, online, or one-to-one.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.offersHeader}>
            <span className="eyebrow">Selected offers</span>
            <h2>Example courses &amp; sessions</h2>
            <p className="lead">
              Sample listings for development. Prices, dates, and places are
              placeholders until Supabase content is connected.
            </p>
          </div>
          <div className={styles.grid}>
            {featured.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      <section className={`section-tight ${styles.ctaBand}`}>
        <div className="container">
          <h2>Ready when you are</h2>
          <p className="lead">
            Create an account to book fixed dates and pay in advance once payments
            are connected.
          </p>
          <Button href="/register">Create account</Button>
        </div>
      </section>
    </>
  );
}
