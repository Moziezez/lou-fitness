import styles from "@/app/pages.module.css";

/** @param {{ error?: string, message?: string }} props */
export default function FormMessage({ error, message }) {
  if (error) {
    return (
      <p className={styles.formError} role="alert">
        {error}
      </p>
    );
  }
  if (message) {
    return (
      <p className={styles.formSuccess} role="status">
        {message}
      </p>
    );
  }
  return null;
}
