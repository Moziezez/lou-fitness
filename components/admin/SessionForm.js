"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import FormMessage from "@/components/auth/FormMessage";
import { saveSession } from "@/lib/courses/actions";
import pageStyles from "@/app/pages.module.css";
import styles from "./admin.module.css";

const HOURS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0"));
// Dates start on the quarter hour; saveSession() enforces the same list.
const MINUTES = ["00", "15", "30", "45"];

/**
 * Add/edit form for one date of a course. `session` is omitted when adding.
 * Times arrive already converted to "YYYY-MM-DDTHH:mm" Kingston time.
 * @param {{
 *   courseId: string,
 *   session?: {
 *     id: string, startsAt: string, location: string | null,
 *     capacity: number | null, published: boolean, reserved: number
 *   }
 * }} props
 */
export default function SessionForm({ courseId, session }) {
  const [state, formAction, pending] = useActionState(saveSession, {});
  const values = state.values ?? {
    startsAt: session?.startsAt ?? "",
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
          <Field label="Date" error={fieldErrors.startsAt}>
            <input
              className={pageStyles.input}
              type="date"
              name="startsDate"
              defaultValue={values.startsAt.slice(0, 10)}
              required
            />
          </Field>
          <Field label="Start time">
            <span className={styles.timeInputs}>
              <select
                className={pageStyles.input}
                name="startsHour"
                aria-label="Hour"
                defaultValue={values.startsAt.slice(11, 13)}
                required
              >
                <option value="" disabled>
                  --
                </option>
                {HOURS.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
              :
              <select
                className={pageStyles.input}
                name="startsMinute"
                aria-label="Minute"
                defaultValue={values.startsAt.slice(14, 16) || "00"}
                required
              >
                {MINUTES.map((minute) => (
                  <option key={minute} value={minute}>
                    {minute}
                  </option>
                ))}
              </select>
            </span>
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
