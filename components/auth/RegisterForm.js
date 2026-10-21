"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import FormMessage from "@/components/auth/FormMessage";
import { signUp } from "@/lib/auth/actions";
import styles from "@/app/pages.module.css";

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(signUp, {});

  if (state.message) {
    return <FormMessage message={state.message} />;
  }

  return (
    <form className={styles.form} action={formAction}>
      <FormMessage error={state.error} />
      <label className={styles.label}>
        Full name
        <input
          className={styles.input}
          type="text"
          name="fullName"
          autoComplete="name"
          defaultValue={state.values?.fullName}
          required
        />
      </label>
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
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
