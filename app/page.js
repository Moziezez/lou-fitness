import Image from "next/image";
import Button from "@/components/ui/Button";
import heroImage from "@/public/images/hero-lou.jpg";
import CourseCard from "@/components/ui/CourseCard";
import { getPublishedCourses } from "@/lib/courses/public";
import styles from "./page.module.css";

// Newest published courses first, from Supabase.
const FEATURED_COUNT = 3;

export default async function HomePage() {
  const courses = await getPublishedCourses();
  const featured = courses.slice(0, FEATURED_COUNT);

  return (
    <>
      <section className={styles.hero} aria-label="Welcome">
        <div className={styles.heroMedia} aria-hidden="true">
          <Image
            src={heroImage}
            alt=""
            fill
            preload
            sizes="100vw"
            placeholder="blur"
            className={styles.heroImage}
          />
        </div>
        <div className={styles.heroContent}>
          <h1 className={styles.brand}>Lou Fitness</h1>
          <p className={styles.headline}>Get in shape with a smile.</p>
          <p className={styles.support}>
            Personal coaching with Lou in Kingston, Jamaica.
            Weekly routines, online courses, and live sessions with fixed dates.
          </p>
          <div className={styles.ctaRow}>
            <Button href="/courses">Browse courses</Button>
            <Button href="/online-access" variant="secondary">
              Join online
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
            <h2>Courses &amp; sessions</h2>
            <p className="lead">
              Online courses and live coaching with fixed dates. Pick one that
              fits your week.
            </p>
          </div>
          {featured.length === 0 ? (
            <p className="lead">New courses are coming soon. Check back shortly.</p>
          ) : (
            <div className={styles.grid}>
              {featured.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
          {courses.length > FEATURED_COUNT ? (
            <div className={styles.offersMore}>
              <Button href="/courses" variant="secondary">
                See all courses
              </Button>
            </div>
          ) : null}
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
