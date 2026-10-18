import { Suspense } from "react";
import Link from "next/link";
import styles from "../../pages.module.css";

export const metadata = { title: "Test checkout" };

async function TestCheckoutDetails({ searchParams }) {
  const params = await searchParams;

  return (
    <div className={`${styles.panel} ${styles.stack}`}>
      <p>
        This page is part of the <strong>test</strong> payment provider. It does{" "}
        <strong>not</strong> confirm a real payment and must never unlock course
        access.
      </p>
      <p className={styles.note}>
        bookingId: {params.bookingId || "—"} · amount: {params.amount || "—"}{" "}
        {params.currency || ""}
      </p>
      <p>
        <Link href="/courses">Back to courses</Link>
      </p>
    </div>
  );
}

export default function TestCheckoutPage({ searchParams }) {
  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Test mode</span>
        <h1>Simulated checkout</h1>
        <Suspense fallback={<p className={styles.note}>Loading checkout details…</p>}>
          <TestCheckoutDetails searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}
