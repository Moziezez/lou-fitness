import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import styles from "../pages.module.css";

export const metadata = { title: "Admin" };

// The role comes from profiles.role on the server, never from client flags.
async function AdminContent() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") notFound();

  return (
    <div className={styles.stack}>
      <h1>Admin area</h1>
      <p className="lead">
        Server-authorized tools to manage courses, fixed sessions, bookings,
        and materials.
      </p>
      <p className={styles.note}>Placeholder only. No admin actions yet.</p>
    </div>
  );
}

export default function AdminPage() {
  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Admin</span>
        <Suspense fallback={<p className={styles.note}>Checking access…</p>}>
          <AdminContent />
        </Suspense>
      </div>
    </section>
  );
}
