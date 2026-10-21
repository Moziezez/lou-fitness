import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";
import styles from "../pages.module.css";

export const metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <div className={styles.authShell}>
      <div className={styles.panel}>
        <h1>Create account</h1>
        <p className={styles.note}>
          Create an account to book courses and live sessions. We&apos;ll email
          you a link to confirm your address.
        </p>
        <RegisterForm />
        <p className={`${styles.note} ${styles.authLinks}`}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
