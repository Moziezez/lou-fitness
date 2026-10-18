import Link from "next/link";
import Button from "@/components/ui/Button";
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
          Password reset emails will be sent through Supabase Auth once configured.
        </p>
        <form className={styles.form}>
          <label className={styles.label}>
            Email
            <input className={styles.input} type="email" name="email" autoComplete="email" required />
          </label>
          <Button type="submit" fullWidth>
            Send reset link (coming soon)
          </Button>
        </form>
        <p className={styles.note} style={{ marginTop: "1rem" }}>
          <Link href="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
