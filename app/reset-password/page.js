import Link from "next/link";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import styles from "../pages.module.css";

export const metadata = {
  title: "Reset password",
};

export default function ResetPasswordPage() {
  return (
    <div className={styles.authShell}>
      <div className={styles.panel}>
        <h1>Reset password</h1>
        <p className={styles.note}>
          Enter your email and we&apos;ll send you a link to choose a new
          password.
        </p>
        <ResetPasswordForm />
        <p className={`${styles.note} ${styles.authLinks}`}>
          <Link href="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
