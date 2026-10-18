import styles from "../../pages.module.css";

export const metadata = { title: "Imprint" };

export default function ImprintPage() {
  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Legal placeholder</span>
        <h1>Imprint</h1>
        <div className={styles.legalBody}>
          <p>
            This page is a structural placeholder. Replace with the operator’s
            legally required imprint information before going live.
          </p>
          <h2>Operator (example)</h2>
          <p>Lou Shine / Lou Fitness — Kingston, Jamaica (Cherry Gardens)</p>
          <p>Contact email and registration details: to be provided.</p>
          <p className={styles.note}>Not legal advice. Example content only.</p>
        </div>
      </div>
    </section>
  );
}
