import Link from "next/link";
import Button from "@/components/ui/Button";
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
          Registration with email verification via Supabase Auth comes next. UI
          shell only.
        </p>
        <form className={styles.form}>
          <label className={styles.label}>
            Full name
            <input className={styles.input} type="text" name="fullName" autoComplete="name" required />
          </label>
          <label className={styles.label}>
            Email
            <input className={styles.input} type="email" name="email" autoComplete="email" required />
          </label>
          <label className={styles.label}>
            Password
            <input
              className={styles.input}
              type="password"
              name="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <Button type="submit" fullWidth>
            Register (coming soon)
          </Button>
        </form>
        <p className={styles.note} style={{ marginTop: "1rem" }}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
