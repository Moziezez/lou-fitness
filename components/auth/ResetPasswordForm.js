"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import FormMessage from "@/components/auth/FormMessage";
import { requestPasswordReset } from "@/lib/auth/actions";
import styles from "@/app/pages.module.css";

export default function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, {});

  if (state.message) {
    return <FormMessage message={state.message} />;
  }

  return (
    <form className={styles.form} action={formAction}>
      <FormMessage error={state.error} />
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
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
