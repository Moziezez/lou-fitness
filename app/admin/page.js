import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import pageStyles from "../pages.module.css";
import styles from "@/components/admin/admin.module.css";

export const metadata = { title: "Admin" };

const sections = [
  {
    href: "/admin/courses",
    title: "Courses",
    text: "Create courses and edit titles, descriptions, prices and visibility.",
  },
];

// The role comes from profiles.role on the server, never from client flags.
async function AdminContent() {
  await requireAdmin();

  return (
    <div className={pageStyles.stack}>
      <h1>Admin area</h1>
      <div className={styles.cards}>
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className={styles.card}>
            <h2>{section.title}</h2>
            <p className={pageStyles.note}>{section.text}</p>
          </Link>
        ))}
      </div>
      <p className={pageStyles.note}>
        Sessions, bookings and materials will follow here.
      </p>
    </div>
  );
}

export default function AdminPage() {
  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Admin</span>
        <Suspense fallback={<p className={pageStyles.note}>Checking access…</p>}>
          <AdminContent />
        </Suspense>
      </div>
    </section>
  );
}
