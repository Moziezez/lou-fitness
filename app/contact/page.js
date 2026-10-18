import styles from "../pages.module.css";
import Button from "@/components/ui/Button";

export const metadata = {
  title: "Contact",
  description: "Contact Lou Fitness — example form and placeholder details.",
};

export default function ContactPage() {
  return (
    <>
      <section className={styles.pageHero}>
        <div className="container">
          <span className="eyebrow">Contact</span>
          <h1>Say hello</h1>
          <p className="lead">
            Example contact page. Form submission will be wired to a server action
            or email provider later.
          </p>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.twoCol}`}>
          <form className={`${styles.panel} ${styles.form}`} method="post" action="#">
            <label className={styles.label}>
              Name
              <input className={styles.input} name="name" type="text" autoComplete="name" required />
            </label>
            <label className={styles.label}>
              Email
              <input
                className={styles.input}
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </label>
            <label className={styles.label}>
              Message
              <textarea className={styles.textarea} name="message" required />
            </label>
            <Button type="submit">Send message (UI only)</Button>
            <p className={styles.note}>
              This form is visual only for now — no emails are sent until a
              backend handler is added.
            </p>
          </form>

          <aside className={styles.panel}>
            <h2>Contact details</h2>
            <p>
              <strong>Coach:</strong> Lou Shine
            </p>
            <p>
              <strong>Area:</strong> Cherry Gardens, Kingston, Jamaica
            </p>
            <p>
              <strong>Email:</strong> hello@example-loufitness.test
            </p>
            <p className={styles.note}>Placeholder address and email — replace with real details.</p>
          </aside>
        </div>
      </section>
    </>
  );
}
