import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";
import styles from "../../pages.module.css";

export const metadata = {
  title: "Choose a new password",
};

// Reached from the reset email via /auth/confirm, which signs the user in.
// proxy.js sends visitors without a session back to /login.
export default function UpdatePasswordPage() {
  return (
    <div className={styles.authShell}>
      <div className={styles.panel}>
        <h1>Choose a new password</h1>
        <p className={styles.note}>Use at least 8 characters.</p>
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
