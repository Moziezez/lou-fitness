import styles from "../../pages.module.css";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Legal placeholder</span>
        <h1>Privacy policy</h1>
        <div className={styles.legalBody}>
          <p>
            Placeholder for a privacy policy covering account data, bookings,
            payments (processed by third-party providers), and analytics if any.
          </p>
          <h2>Intended topics</h2>
          <p>Controller identity · data categories · purposes · retention · rights · processors (Supabase, payment provider).</p>
          <p className={styles.note}>Draft with qualified counsel before launch.</p>
        </div>
      </div>
    </section>
  );
}
