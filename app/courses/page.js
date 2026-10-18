import CourseCard from "@/components/ui/CourseCard";
import { getPublishedCourses } from "@/data/sample-courses";
import styles from "../pages.module.css";

export const metadata = {
  title: "Courses",
  description: "Browse example Lou Fitness courses and fixed session dates.",
};

export default function CoursesPage() {
  const courses = getPublishedCourses();

  return (
    <>
      <section className={styles.pageHero}>
        <div className="container">
          <span className="eyebrow">Courses</span>
          <h1>Find your next session</h1>
          <p className="lead">
            Example catalogue with fixed dates. Online, group, and live formats —
            sample prices in USD.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.grid}>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
