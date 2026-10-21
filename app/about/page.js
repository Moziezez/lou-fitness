import Button from "@/components/ui/Button";
import styles from "../pages.module.css";

export const metadata = {
  title: "About",
  description: "About Lou Shine and the Lou Fitness coaching approach.",
};

export default function AboutPage() {
  return (
    <>
      <section className={styles.pageHero}>
        <div className="container">
          <span className="eyebrow">About</span>
          <h1>Lou Shine</h1>
          <p className="lead">
            Personal coach based in Kingston, Jamaica. Over 10 years of experience in fitness coaching.
          </p>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.twoCol}`}>
          <div className={styles.stack}>
            <h2>A warm, practical path to fitness</h2>
            <p>
              Lou helps people build a weekly fitness routine
              they can enjoy. Sessions mix clear coaching, approachable movement,
              and encouragement — get in shape with a smile.
            </p>
            <p>
              Placeholders only: no real certifications, client testimonials, or
              medical claims are listed here. Replace this section with Lou’s
              verified background when ready.
            </p>
            <h2>Coaching approach</h2>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <strong>Routine first</strong>
                <span className={styles.note}>
                  Fixed dates and simple weekly structure so showing up gets easier.
                </span>
              </li>
              <li className={styles.listItem}>
                <strong>Meet people where they are</strong>
                <span className={styles.note}>
                  Online courses, group sessions, and one-to-one live coaching.
                </span>
              </li>
              <li className={styles.listItem}>
                <strong>Local roots</strong>
                <span className={styles.note}>
                  Grounded in Kingston, with online access for
                  flexible practice.
                </span>
              </li>
            </ul>
          </div>

          <aside className={styles.panel}>
            <span className="eyebrow">At a glance</span>
            <p>
              <strong>Coach:</strong> Lou Shine (example profile)
            </p>
            <p>
              <strong>Location:</strong> Kingston, Jamaica
            </p>
            <p>
              <strong>Offers:</strong> Online courses · Group sessions · Live coaching
            </p>
            <p className={styles.note}>
              Qualifications and credentials will be added once confirmed — nothing
              invented here.
            </p>
            <Button href="/contact">Get in touch</Button>
          </aside>
        </div>
      </section>
    </>
  );
}
