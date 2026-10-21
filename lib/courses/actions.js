"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { COURSE_FORMATS } from "./formats";
import { COURSE_IMAGE_BUCKET, MAX_IMAGE_BYTES } from "./images";
import { COURSES_TAG } from "./public";
import { fromLocalInput, SESSION_TIMEZONE } from "./time";

/**
 * @typedef {Object} CourseFormState
 * @property {string} [error]
 * @property {Record<string, string>} [fieldErrors]
 * @property {Record<string, string>} [values] Submitted values to refill the form.
 */

const FORMATS = new Set(COURSE_FORMATS.map((format) => format.value));
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const PRICE_PATTERN = /^\d{1,7}(\.\d{1,2})?$/;

function text(formData, name) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// "45" / "45.5" / "45.50" -> 4500 / 4550 / 4550, without float rounding.
function toMinorUnits(price) {
  const [whole, fraction = ""] = price.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

// Detects the image type from its first bytes; the browser-sent MIME type
// and file name are not trusted.
async function sniffImageType(file) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const ascii = (from, to) => String.fromCharCode(...bytes.slice(from, to));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: "jpg", contentType: "image/jpeg" };
  }
  if (ascii(1, 4) === "PNG" && bytes[0] === 0x89) {
    return { ext: "png", contentType: "image/png" };
  }
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    return { ext: "webp", contentType: "image/webp" };
  }
  return null;
}

/**
 * Creates a course, or updates it when the form carries an `id`.
 * Authorization is checked here and again by RLS (admins only).
 * @returns {Promise<CourseFormState>}
 */
export async function saveCourse(_prevState, formData) {
  const id = text(formData, "id");
  await requireAdmin(id ? `/admin/courses/${id}` : "/admin/courses/new");

  const values = {
    title: text(formData, "title"),
    slug: text(formData, "slug"),
    summary: text(formData, "summary"),
    description: text(formData, "description"),
    format: text(formData, "format"),
    price: text(formData, "price"),
    currency: text(formData, "currency").toUpperCase() || "USD",
    published: formData.get("published") === "on" ? "on" : "",
  };
  const slug = slugify(values.slug || values.title);

  /** @type {Record<string, string>} */
  const fieldErrors = {};
  if (!values.title) fieldErrors.title = "Please enter a title.";
  else if (values.title.length > 120) fieldErrors.title = "Keep the title under 120 characters.";
  if (!SLUG_PATTERN.test(slug)) {
    fieldErrors.slug = "Use lowercase letters, numbers and hyphens, e.g. weekly-foundation.";
  }
  if (values.summary.length > 300) fieldErrors.summary = "Keep the summary under 300 characters.";
  if (!values.description) fieldErrors.description = "Please enter a description.";
  if (!FORMATS.has(values.format)) fieldErrors.format = "Choose a format.";
  if (!PRICE_PATTERN.test(values.price)) {
    fieldErrors.price = "Enter a price like 45 or 45.00.";
  }
  if (!/^[A-Z]{3}$/.test(values.currency)) {
    fieldErrors.currency = "Use a 3-letter currency code like USD or JMD.";
  }

  const file = formData.get("image");
  const upload = file instanceof File && file.size > 0 ? file : null;
  const imageType = upload ? await sniffImageType(upload) : null;
  if (upload && upload.size > MAX_IMAGE_BYTES) {
    fieldErrors.image = "The image must be 5 MB or smaller.";
  } else if (upload && !imageType) {
    fieldErrors.image = "Upload a JPEG, PNG or WebP image.";
  }
  const removeImage = !upload && formData.get("removeImage") === "on";

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Please fix the highlighted fields.", fieldErrors, values };
  }

  const course = {
    title: values.title,
    slug,
    summary: values.summary || null,
    description: values.description,
    format: values.format,
    price_minor_units: toMinorUnits(values.price),
    currency: values.currency,
    published: values.published === "on",
  };

  const supabase = await createClient();
  const images = supabase.storage.from(COURSE_IMAGE_BUCKET);

  // Read the stored path, never a form field, to know which file to replace.
  let previousImage = null;
  if (id && (upload || removeImage)) {
    const { data: current } = await supabase
      .from("courses")
      .select("image_path")
      .eq("id", id)
      .maybeSingle();
    previousImage = current?.image_path ?? null;
  }

  // A fresh name per upload, so cached copies of the old image never linger.
  let uploadedImage = null;
  if (upload) {
    uploadedImage = `${crypto.randomUUID()}.${imageType.ext}`;
    const { error: uploadError } = await images.upload(uploadedImage, upload, {
      contentType: imageType.contentType,
      cacheControl: "31536000",
    });
    if (uploadError) {
      console.error("Uploading course image failed", uploadError);
      return { error: "The image couldn't be uploaded. Please try again.", values };
    }
    course.image_path = uploadedImage;
  } else if (removeImage) {
    course.image_path = null;
  }

  const { data, error } = id
    ? await supabase.from("courses").update(course).eq("id", id).select("id")
    : await supabase.from("courses").insert(course).select("id");

  if (error || data.length === 0) {
    if (uploadedImage) await images.remove([uploadedImage]);
  } else if (previousImage && previousImage !== course.image_path) {
    const { error: removeError } = await images.remove([previousImage]);
    if (removeError) console.error("Removing old course image failed", removeError);
  }

  if (error?.code === "23505") {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: { slug: "Another course already uses this URL." },
      values: { ...values, slug },
    };
  }
  if (error || data.length === 0) {
    console.error("Saving course failed", error);
    return { error: "The course couldn't be saved. Please try again.", values };
  }

  updateTag(COURSES_TAG);
  // New courses continue on the edit page, where their dates are added.
  if (!id) redirect(`/admin/courses/${data[0].id}?saved=created#dates`);
  redirect(`/admin/courses?saved=${encodeURIComponent(slug)}`);
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_SEATS = 10000;
const QUARTER_HOURS = ["00", "15", "30", "45"];

/**
 * Creates, updates or (with intent=delete) deletes one date of a course.
 * Authorization is checked here and again by RLS (admins only).
 * @returns {Promise<CourseFormState>}
 */
export async function saveSession(_prevState, formData) {
  const courseId = text(formData, "courseId");
  const sessionId = text(formData, "sessionId");
  await requireAdmin(`/admin/courses/${courseId}`);
  if (!UUID_PATTERN.test(courseId) || (sessionId && !UUID_PATTERN.test(sessionId))) {
    return { error: "This date can't be found. Reload the page and try again." };
  }

  const supabase = await createClient();
  const done = (saved) => {
    updateTag(COURSES_TAG);
    redirect(`/admin/courses/${courseId}?saved=${saved}#dates`);
  };

  if (sessionId && formData.get("intent") === "delete") {
    const { data, error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", sessionId)
      .eq("course_id", courseId)
      .select("id");
    if (error?.code === "23503") {
      return { error: "This date has bookings, so it can't be deleted. Unpublish it instead." };
    }
    if (error || data.length === 0) {
      console.error("Deleting session failed", error);
      return { error: "The date couldn't be deleted. Please try again." };
    }
    done("date-deleted");
  }

  const startsDate = text(formData, "startsDate");
  const startsHour = text(formData, "startsHour");
  const startsMinute = text(formData, "startsMinute");
  const values = {
    startsAt: `${startsDate}T${startsHour}:${startsMinute}`,
    location: text(formData, "location"),
    capacity: text(formData, "capacity"),
    published: formData.get("published") === "on" ? "on" : "",
  };
  const startsAt = QUARTER_HOURS.includes(startsMinute) ? fromLocalInput(values.startsAt) : null;
  const capacity = Number(values.capacity);

  /** @type {Record<string, string>} */
  const fieldErrors = {};
  if (!startsAt) fieldErrors.startsAt = "Choose a start date, hour and minute (00, 15, 30 or 45).";
  if (!/^\d+$/.test(values.capacity) || capacity < 1 || capacity > MAX_SEATS) {
    fieldErrors.capacity = `Enter a whole number from 1 to ${MAX_SEATS}.`;
  }
  if (values.location.length > 200) fieldErrors.location = "Keep the location under 200 characters.";

  if (!fieldErrors.capacity && sessionId) {
    const { data: seats } = await supabase
      .from("session_seats")
      .select("reserved")
      .eq("session_id", sessionId)
      .maybeSingle();
    if (seats && capacity < seats.reserved) {
      fieldErrors.capacity = `${seats.reserved} seats are already reserved.`;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Please fix the highlighted fields.", fieldErrors, values };
  }

  const session = {
    starts_at: startsAt.toISOString(),
    // Dates have no end time; clearing it also keeps an old end from preceding a new start.
    ends_at: null,
    timezone: SESSION_TIMEZONE,
    capacity,
    location: values.location || null,
    published: values.published === "on",
  };

  const { data, error } = sessionId
    ? await supabase
        .from("sessions")
        .update(session)
        .eq("id", sessionId)
        .eq("course_id", courseId)
        .select("id")
    : await supabase
        .from("sessions")
        .insert({ ...session, course_id: courseId })
        .select("id");

  if (error || data.length === 0) {
    console.error("Saving session failed", error);
    return { error: "The date couldn't be saved. Please try again.", values };
  }

  done(sessionId ? "date-updated" : "date-added");
}
