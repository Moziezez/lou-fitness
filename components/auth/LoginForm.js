"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import FormMessage from "@/components/auth/FormMessage";
import { signIn } from "@/lib/auth/actions";
import styles from "@/app/pages.module.css";

/** @param {{ next?: string, initialError?: string, initialMessage?: string }} props */
export default function LoginForm({ next = "/dashboard", initialError, initialMessage }) {
  const [state, formAction, pending] = useActionState(signIn, {
    error: initialError,
    message: initialMessage,
  });

  return (
    <form className={styles.form} action={formAction}>
      <FormMessage error={state.error} message={state.message} />
      <input type="hidden" name="next" value={next} />
      <label className={styles.label}>
        Email
        <input
          className={styles.input}
          type="email"
          name="email"
          autoComplete="email"
          defaultValue={state.values?.email}
          required
        />
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
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
