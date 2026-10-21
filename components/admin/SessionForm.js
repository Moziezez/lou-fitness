"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import FormMessage from "@/components/auth/FormMessage";
import { saveSession } from "@/lib/courses/actions";
import pageStyles from "@/app/pages.module.css";
import styles from "./admin.module.css";

/**
 * Add/edit form for one date of a course. `session` is omitted when adding.
 * Times arrive already converted to "YYYY-MM-DDTHH:mm" Kingston time.
 * @param {{
 *   courseId: string,
 *   session?: {
 *     id: string, startsAt: string, endsAt: string, location: string | null,
 *     capacity: number | null, published: boolean, reserved: number
 *   }
 * }} props
 */
export default function SessionForm({ courseId, session }) {
  const [state, formAction, pending] = useActionState(saveSession, {});
  const values = state.values ?? {
    startsAt: session?.startsAt ?? "",
    endsAt: session?.endsAt ?? "",
    location: session?.location ?? "",
    capacity: session?.capacity == null ? "" : String(session.capacity),
    published: !session || session.published ? "on" : "",
  };
  const fieldErrors = state.fieldErrors ?? {};
  const formKey = JSON.stringify(values);

  return (
    <form className={`${pageStyles.form} ${styles.sessionCard}`} action={formAction}>
      <div className={styles.sessionHeader}>
        <strong>{session ? "Date" : "Add a date"}</strong>
        {session ? (
          <span className={pageStyles.note}>
            {session.capacity
              ? `${session.reserved}/${session.capacity}`
              : session.reserved}{" "}
            seats reserved
          </span>
        ) : null}
      </div>
      <FormMessage error={state.error} />
      <input type="hidden" name="courseId" value={courseId} />
      {session ? <input type="hidden" name="sessionId" value={session.id} /> : null}

      <div key={formKey} className={pageStyles.form}>
        <div className={styles.sessionRow}>
          <Field label="Starts" error={fieldErrors.startsAt}>
            <input
              className={pageStyles.input}
              type="datetime-local"
              name="startsAt"
              defaultValue={values.startsAt}
              required
            />
          </Field>
          <Field label="Ends" error={fieldErrors.endsAt}>
            <input
              className={pageStyles.input}
              type="datetime-local"
              name="endsAt"
              defaultValue={values.endsAt}
              required
            />
          </Field>
          <Field label="Max seats" error={fieldErrors.capacity}>
            <input
              className={pageStyles.input}
              type="number"
              name="capacity"
              min={1}
              max={10000}
              step={1}
              defaultValue={values.capacity}
              placeholder="12"
              required
            />
          </Field>
        </div>

        <Field
          label="Location"
          hint="A venue, or e.g. “Online video call”. Optional."
          error={fieldErrors.location}
        >
          <input
            className={pageStyles.input}
            name="location"
            defaultValue={values.location}
            maxLength={200}
          />
        </Field>

        <label className={styles.checkbox}>
          <input type="checkbox" name="published" defaultChecked={values.published === "on"} />
          <span>
            Published
            <small className={pageStyles.note}>
              Shown on the course page while the course is published too.
            </small>
          </span>
        </label>
      </div>

      <div className={styles.actions}>
        <Button type="submit" variant={session ? "secondary" : "primary"} disabled={pending}>
          {pending ? "Saving…" : session ? "Save date" : "Add date"}
        </Button>
        {session ? (
          <Button
            type="submit"
            variant="ghost"
            name="intent"
            value="delete"
            formNoValidate
            disabled={pending}
          >
            Delete
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function Field({ label, hint, error, children }) {
  return (
    <label className={pageStyles.label}>
      {label}
      {children}
      {error ? (
        <span className={styles.fieldError}>{error}</span>
      ) : hint ? (
        <span className={styles.hint}>{hint}</span>
      ) : null}
    </label>
  );
}
