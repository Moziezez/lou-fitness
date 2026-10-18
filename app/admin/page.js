import styles from "../pages.module.css";

export const metadata = { title: "Admin" };

export default function AdminPlaceholderPage() {
  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Coming next</span>
        <h1>Admin area</h1>
        <div className={styles.stack}>
          <p className="lead">
            Server-authorized tools to manage courses, fixed sessions, bookings,
            and materials. Role checks will use the `profiles.role` column — never
            client-only flags.
          </p>
          <p className={styles.note}>Placeholder only. No admin actions yet.</p>
        </div>
      </div>
    </section>
  );
}
