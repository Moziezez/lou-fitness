/**
 * Example content only — not real offerings, credentials, or reviews.
 * Will be replaced by Supabase `courses` / `sessions` tables.
 */

export const SAMPLE_COURSES = [
  {
    id: "course-weekly-foundation",
    slug: "weekly-foundation",
    title: "Weekly Foundation",
    format: "group",
    summary:
      "A friendly weekly group session to build a routine you can stick with.",
    description:
      "Example course. Start your weekly fitness routine with guided movement, light strength work, and room to smile through it. Suitable for beginners who want structure without pressure.",
    priceCents: 4500,
    currency: "USD",
    published: true,
    imageHint: "outdoor group stretch at sunrise",
    sessions: [
      {
        id: "session-wf-1",
        startsAt: "2026-11-04T15:00:00-05:00",
        endsAt: "2026-11-04T16:00:00-05:00",
        timezone: "America/Jamaica",
        location: "Cherry Gardens, Kingston (example venue)",
        meetingUrl: null,
        capacity: 12,
        seatsTaken: 4,
      },
      {
        id: "session-wf-2",
        startsAt: "2026-11-11T15:00:00-05:00",
        endsAt: "2026-11-11T16:00:00-05:00",
        timezone: "America/Jamaica",
        location: "Cherry Gardens, Kingston (example venue)",
        meetingUrl: null,
        capacity: 12,
        seatsTaken: 7,
      },
    ],
  },
  {
    id: "course-home-energy",
    slug: "home-energy-flow",
    title: "Home Energy Flow",
    format: "online",
    summary: "Self-paced online modules you can follow from home.",
    description:
      "Example online course. Short video sessions focused on mobility, posture, and feel-good cardio you can repeat during the week.",
    priceCents: 6900,
    currency: "USD",
    published: true,
    imageHint: "home workout mat near open window",
    sessions: [
      {
        id: "session-he-1",
        startsAt: "2026-11-01T00:00:00-05:00",
        endsAt: "2026-12-31T23:59:00-05:00",
        timezone: "America/Jamaica",
        location: "Online — self-paced access window (example)",
        meetingUrl: null,
        capacity: 100,
        seatsTaken: 18,
      },
    ],
  },
  {
    id: "course-live-1on1",
    slug: "live-coaching-60",
    title: "Live Coaching · 60 minutes",
    format: "live",
    summary: "One-to-one live coaching with a fixed appointment.",
    description:
      "Example live coaching offer. A focused 60-minute session covering form, motivation, and a simple plan for the week ahead.",
    priceCents: 9000,
    currency: "USD",
    published: true,
    imageHint: "personal trainer coaching outdoors",
    sessions: [
      {
        id: "session-lc-1",
        startsAt: "2026-11-06T09:00:00-05:00",
        endsAt: "2026-11-06T10:00:00-05:00",
        timezone: "America/Jamaica",
        location: "Online video call (link after payment)",
        meetingUrl: null,
        capacity: 1,
        seatsTaken: 0,
      },
      {
        id: "session-lc-2",
        startsAt: "2026-11-08T17:00:00-05:00",
        endsAt: "2026-11-08T18:00:00-05:00",
        timezone: "America/Jamaica",
        location: "Cherry Gardens studio visit (example)",
        meetingUrl: null,
        capacity: 1,
        seatsTaken: 1,
      },
      {
        id: "session-lc-3",
        startsAt: "2026-11-13T09:00:00-05:00",
        endsAt: "2026-11-13T10:00:00-05:00",
        timezone: "America/Jamaica",
        location: "Online video call (link after payment)",
        meetingUrl: null,
        capacity: 1,
        seatsTaken: 0,
      },
    ],
  },
];

export function getPublishedCourses() {
  return SAMPLE_COURSES.filter((course) => course.published);
}

export function getCourseBySlug(slug) {
  return getPublishedCourses().find((course) => course.slug === slug) ?? null;
}

export function getLiveCoachingCourses() {
  return getPublishedCourses().filter((course) => course.format === "live");
}

export function formatPrice(priceCents, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(priceCents / 100);
}

export function formatSessionRange(session, locale = "en-US") {
  const start = new Date(session.startsAt);
  const date = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: session.timezone,
  }).format(start);
  const time = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: session.timezone,
  });
  const range = session.endsAt
    ? `${time.format(start)} – ${time.format(new Date(session.endsAt))}`
    : time.format(start);
  return `${date} · ${range} (${session.timezone})`;
}

export function seatsLeft(session) {
  return Math.max(session.capacity - session.seatsTaken, 0);
}
