import Link from "next/link";
import Button from "@/components/ui/Button";
import styles from "../pages.module.css";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className={styles.authShell}>
      <div className={styles.panel}>
        <h1>Sign in</h1>
        <p className={styles.note}>
          Supabase Auth will power this form in the next milestone. UI shell only.
        </p>
        <form className={styles.form}>
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
              autoComplete="current-password"
              required
            />
          </label>
          <Button type="submit" fullWidth>
            Sign in (coming soon)
          </Button>
        </form>
        <p className={styles.note} style={{ marginTop: "1rem" }}>
          <Link href="/reset-password">Forgot password?</Link>
          {" · "}
          <Link href="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
