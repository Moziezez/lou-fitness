import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth/session";
import { signOut } from "@/lib/auth/actions";
import styles from "../pages.module.css";

export const metadata = { title: "Dashboard" };

async function Account() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <div className={styles.stack}>
      <h1>Welcome{user.fullName ? `, ${user.fullName}` : ""}</h1>
      <div className={`${styles.panel} ${styles.stack}`}>
        <p>
          Signed in as <strong>{user.email}</strong>
          {user.role === "admin" ? (
            <>
              {" "}
              <Link href="/admin" className={`${styles.badge} ${styles.badgeLink}`}>
                Admin
              </Link>
            </>
          ) : null}
        </p>
        <p className={styles.note}>
          Your bookings, upcoming sessions and course materials will appear
          here. Until then, <Link href="/courses">browse the courses</Link>.
        </p>
        <form action={signOut}>
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Your account</span>
        <Suspense fallback={<p className={styles.note}>Loading your account…</p>}>
          <Account />
        </Suspense>
      </div>
    </section>
  );
}
