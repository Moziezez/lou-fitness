"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import FormMessage from "@/components/auth/FormMessage";
import { updatePassword } from "@/lib/auth/actions";
import styles from "@/app/pages.module.css";

export default function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, {});

  return (
    <form className={styles.form} action={formAction}>
      <FormMessage error={state.error} />
      <label className={styles.label}>
        New password
        <input
          className={styles.input}
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      <label className={styles.label}>
        Confirm new password
        <input
          className={styles.input}
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}
