import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";
import { safeRedirectPath } from "@/lib/auth/redirect";
import styles from "../pages.module.css";

export const metadata = {
  title: "Sign in",
};

const linkErrors = {
  confirm_link_invalid:
    "That confirmation link is invalid or has expired. Try signing in, or register again to get a new link.",
  reset_link_invalid:
    "That reset link is invalid or has expired. Please request a new one.",
};

async function LoginFormWithParams({ searchParams }) {
  const params = await searchParams;
  return (
    <LoginForm
      next={safeRedirectPath(params.next)}
      initialError={linkErrors[params.error]}
    />
  );
}

export default function LoginPage({ searchParams }) {
  return (
    <div className={styles.authShell}>
      <div className={styles.panel}>
        <h1>Sign in</h1>
        <p className={styles.note}>Welcome back. Sign in to see your bookings.</p>
        <Suspense fallback={<LoginForm />}>
          <LoginFormWithParams searchParams={searchParams} />
        </Suspense>
        <p className={`${styles.note} ${styles.authLinks}`}>
          <Link href="/reset-password">Forgot password?</Link>
          {" · "}
          <Link href="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
