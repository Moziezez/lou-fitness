import Link from "next/link";
import styles from "../pages.module.css";

export const metadata = { title: "Dashboard" };

export default function DashboardPlaceholderPage() {
  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Coming next</span>
        <h1>Customer dashboard</h1>
        <div className={styles.stack}>
          <p className="lead">
            Protected area for profile, bookings, upcoming sessions, and unlocked
            materials. Requires Supabase Auth (milestone 3+).
          </p>
          <p className={styles.note}>
            <Link href="/login">Sign in</Link> shell is already available.
          </p>
        </div>
      </div>
    </section>
  );
}
