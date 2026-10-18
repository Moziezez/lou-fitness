import styles from "../../pages.module.css";

export const metadata = { title: "Withdrawal" };

export default function WithdrawalPage() {
  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Legal placeholder</span>
        <h1>Withdrawal / cancellation</h1>
        <div className={styles.legalBody}>
          <p>
            Placeholder for consumer withdrawal and cancellation information
            applicable to prepaid online courses and live coaching.
          </p>
          <p className={styles.note}>
            Do not publish invented refund guarantees. Add jurisdiction-specific
            wording before accepting payments.
          </p>
        </div>
      </div>
    </section>
  );
}
