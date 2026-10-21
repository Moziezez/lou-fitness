"use client";

import { useActionState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import FormMessage from "@/components/auth/FormMessage";
import { saveCourse } from "@/lib/courses/actions";
import { COURSE_FORMATS } from "@/lib/courses/formats";
import { courseImageUrl, IMAGE_ACCEPT } from "@/lib/courses/images";
import pageStyles from "@/app/pages.module.css";
import styles from "./admin.module.css";

function formatPriceInput(minorUnits) {
  return minorUnits == null ? "" : (minorUnits / 100).toFixed(2);
}

/**
 * Create/edit form for a course. `course` is omitted when creating.
 * @param {{ course?: import("@/lib/courses/admin").AdminCourse }} props
 */
export default function CourseForm({ course }) {
  const [state, formAction, pending] = useActionState(saveCourse, {});
  const values = state.values ?? {
    title: course?.title ?? "",
    slug: course?.slug ?? "",
    summary: course?.summary ?? "",
    description: course?.description ?? "",
    format: course?.format ?? "online_course",
    price: formatPriceInput(course?.price_minor_units),
    currency: course?.currency ?? "USD",
    published: course?.published ? "on" : "",
  };
  const fieldErrors = state.fieldErrors ?? {};

  // Remount the fields after each submission so defaultValue refills them.
  const formKey = JSON.stringify(values);
  const imageUrl = courseImageUrl(course?.image_path);

  return (
    <form className={pageStyles.form} action={formAction}>
      <FormMessage error={state.error} />
      {course ? <input type="hidden" name="id" value={course.id} /> : null}

      <div key={formKey} className={pageStyles.form}>
        <Field label="Title" error={fieldErrors.title}>
          <input
            className={pageStyles.input}
            name="title"
            defaultValue={values.title}
            maxLength={120}
            required
          />
        </Field>

        <Field
          label="URL slug"
          hint="Shown in the address: /courses/your-slug. Leave empty to create it from the title."
          error={fieldErrors.slug}
        >
          <input
            className={pageStyles.input}
            name="slug"
            defaultValue={values.slug}
            placeholder="weekly-foundation"
          />
        </Field>

        <Field
          label="Summary"
          hint="One or two sentences for the course cards. Optional."
          error={fieldErrors.summary}
        >
          <textarea
            className={`${pageStyles.textarea} ${styles.short}`}
            name="summary"
            defaultValue={values.summary}
            maxLength={300}
          />
        </Field>

        <Field label="Description" error={fieldErrors.description}>
          <textarea
            className={pageStyles.textarea}
            name="description"
            defaultValue={values.description}
            required
          />
        </Field>

        <div className={styles.row}>
          <Field label="Format" error={fieldErrors.format}>
            <select className={pageStyles.input} name="format" defaultValue={values.format}>
              {COURSE_FORMATS.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Price" error={fieldErrors.price}>
            <input
              className={pageStyles.input}
              name="price"
              inputMode="decimal"
              defaultValue={values.price}
              placeholder="45.00"
              required
            />
          </Field>

          <Field label="Currency" error={fieldErrors.currency}>
            <input
              className={pageStyles.input}
              name="currency"
              defaultValue={values.currency}
              maxLength={3}
              required
            />
          </Field>
        </div>

        <Field
          label="Image"
          hint={
            imageUrl
              ? "Choose a file to replace the current image. JPEG, PNG or WebP, up to 5 MB."
              : "Shown on the course card and page. JPEG, PNG or WebP, up to 5 MB. Optional."
          }
          error={fieldErrors.image}
        >
          {imageUrl ? (
            <Image
              className={styles.imagePreview}
              src={imageUrl}
              alt="Current course image"
              width={640}
              height={400}
              sizes="20rem"
            />
          ) : null}
          <input className={pageStyles.input} type="file" name="image" accept={IMAGE_ACCEPT} />
        </Field>

        {imageUrl ? (
          <label className={styles.checkbox}>
            <input type="checkbox" name="removeImage" />
            <span>Remove current image</span>
          </label>
        ) : null}

        <label className={styles.checkbox}>
          <input type="checkbox" name="published" defaultChecked={values.published === "on"} />
          <span>
            Published
            <small className={pageStyles.note}>
              Unpublished courses are only visible in the admin area.
            </small>
          </span>
        </label>
      </div>

      <div className={styles.actions}>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : course ? "Save changes" : "Create course"}
        </Button>
        <Button href="/admin/courses" variant="ghost">
          Cancel
        </Button>
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
