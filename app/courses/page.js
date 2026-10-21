import CourseCard from "@/components/ui/CourseCard";
import { getPublishedCourses } from "@/lib/courses/public";
import styles from "../pages.module.css";

export const metadata = {
  title: "Courses",
  description: "Browse Lou Fitness courses and fixed session dates.",
};

export default async function CoursesPage() {
  const courses = await getPublishedCourses();

  return (
    <>
      <section className={styles.pageHero}>
        <div className="container">
          <span className="eyebrow">Courses</span>
          <h1>Find your next session</h1>
          <p className="lead">
            Online courses and live coaching with fixed dates.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {courses.length === 0 ? (
            <p className={styles.note}>New courses are coming soon. Check back shortly.</p>
          ) : (
            <div className={styles.grid}>
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
