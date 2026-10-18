import styles from "../../pages.module.css";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Legal placeholder</span>
        <h1>Terms &amp; conditions</h1>
        <div className={styles.legalBody}>
          <p>
            Placeholder for terms covering accounts, bookings, prepaid sessions,
            code of conduct, and limitation of liability.
          </p>
          <p className={styles.note}>Example structure only — not enforceable terms.</p>
        </div>
      </div>
    </section>
  );
}
