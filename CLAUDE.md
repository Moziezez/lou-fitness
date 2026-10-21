@AGENTS.md

# CLAUDE.md

Lou Fitness: a personal-coaching platform for Lou Shine (Kingston, Jamaica) that sells online courses and live coaching with fixed dates, account registration, booking and prepayment. The site's UI copy is English. Planning docs ([IMPLEMENTATION.md](IMPLEMENTATION.md), [docs/PAYMENTS.md](docs/PAYMENTS.md), [supabase/README.md](supabase/README.md)) and API error messages are German.

## Commands

```bash
npm run dev     # next dev (Turbopack), http://localhost:3000
npm run build
npm run start
npm run lint    # ESLint 9 flat config, eslint-config-next core-web-vitals
```

There is no test suite. Copy `.env.example` to `.env.local` before running. `GET /api/health/supabase` checks that the Supabase URL and key work.

## Stack and Next.js 16 specifics

- Next.js 16.4 App Router, React 19.3, **plain JavaScript** (no TypeScript; shapes are documented with JSDoc `@typedef`). Import alias `@/*` maps to the repo root.
- `next.config.mjs` enables `cacheComponents` and `partialPrefetching`. With Cache Components on, any read of request data (`searchParams`, `cookies()`, `headers()`, uncached fetches) has to sit inside a `<Suspense>` boundary. See [app/checkout/test/page.js](app/checkout/test/page.js) for the pattern.
- `params` and `searchParams` are Promises and must be awaited.
- **[proxy.js](proxy.js) is Next 16's replacement for `middleware.js`** (the exported function is `proxy`). It refreshes the Supabase auth session cookies on every non-static request.
- Before using any Next API you're unsure of, check `node_modules/next/dist/docs/`, as AGENTS.md says.

## Architecture

- `app/`: routes. The pages are currently flat (`about`, `courses`, `courses/[slug]`, `live-coaching`, `contact`, `login`, `register`, `reset-password`, `dashboard`, `admin`, `legal/*`, `checkout/test`). The planned move to route groups `(public)/(auth)/(customer)/(admin)` is described in IMPLEMENTATION.md. Shared page styles live in `app/pages.module.css`.
- `components/layout` (Header is the only Client Component; Footer) and `components/ui` (`Button`, which renders a `Link` when given `href`, and `CourseCard`).
- `data/sample-courses.js`: **example data** used by the public pages until the Supabase tables are wired in. It also exports the helpers `getPublishedCourses`, `getCourseBySlug`, `formatPrice`, `formatSessionRange` and `seatsLeft`.
- `lib/supabase/`: `client.js` (browser client) and `server.js` (async, cookie-based server client). Both use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. A service-role `admin.js` is planned. It must be server-only and never imported from a Client Component.
- `lib/courses/`: `admin.js` (server reads for the admin area), `actions.js` (Server Action `saveCourse`, checks `requireAdmin()` from `lib/auth/session.js`), `formats.js` (format values and labels, safe for Client Components). Admin UI: `app/admin/courses` (list, `new`, `[id]` edit) with `components/admin/`.
- `lib/payments/`: a swappable provider interface. `getPaymentProvider()` picks `test`, `paynowpro` or `fygaro` from `PAYMENT_PROVIDER` (default `test`). Each provider implements `createCheckout`, `verifyWebhook` and `getPaymentStatus`. The PayNowPro and Fygaro adapters are stubs that throw until credentials exist.
- `supabase/migrations/`: `0001_init.sql` creates the tables `profiles`, `courses`, `sessions`, `bookings` and `payments`, the `private` helper schema, `updated_at` triggers, the profile-on-signup trigger and RLS. `0002_merge_read_policies.sql` merges the per-table SELECT policies. `0003_admin_course_writes.sql` adds `courses.summary`, a slug format check and admin-only INSERT/UPDATE on `courses` (no DELETE; unpublish instead). `0004_sessions_admin_and_seats.sql` adds the `live_online` format, admin-only INSERT/UPDATE/DELETE on `sessions`, and the `session_seats` view (reserved = pending + confirmed bookings, readable by `authenticated` only, via `private.reserved_seat_count()`). `0005_course_images.sql` adds `courses.image_path` and the public `course-images` Storage bucket (5 MB, JPEG/PNG/WebP; writes admin-only). Uploads go through `saveCourse` (`lib/courses/actions.js`, file type sniffed from its bytes); URLs come from `courseImageUrl()` in `lib/courses/images.js`, and `next.config.mjs` allows that bucket in `images.remotePatterns` and raises the Server Action body limit to 6 MB. All five are applied to project `eydfotinnemasvrwntpa` (via the Supabase MCP in `.mcp.json`; no local CLI stack). Once a migration has been applied, don't edit it; add a new forward migration instead.

### Known model mismatch

The sample data doesn't match the DB schema yet, so map the fields when you switch pages to Supabase:

| Sample data | DB |
|---|---|
| `priceCents` (payment types also use `amountCents`) | `price_minor_units`, `amount_minor_units` |
| `format: "group" \| "online"` | `format in ('online_course','live_coaching','live_online')` |
| `seatsTaken` | not stored; derive it from `bookings` |
| `summary` | `summary` (nullable, max 300 chars) |
| `imageHint` | not stored |

## Invariants (security and payments)

- **A test payment never counts as paid.** The test provider returns `status: "simulated"` and `isAuthoritative: false`. Course access must never be unlocked from it.
- Unlock access only after a **server-verified webhook** (signature check, idempotent on `eventId` / `(provider, external_reference)`). Never unlock from the success/return URL alone.
- Always load prices on the server from the DB. Never trust amounts sent by the client.
- Keep booking status (`pending/confirmed/cancelled`) and payment status (`pending/succeeded/failed/simulated/refunded`) separate.
- Never store or handle card data. Provider secrets belong in server env vars only (never `NEXT_PUBLIC_*`).
- The RLS in the migration is deliberately **read-only** for `anon`/`authenticated`, and `meeting_url` is hidden from both. Add write paths through server code with explicit authorization checks and narrowly scoped policies. Admin is decided by `profiles.role = 'admin'` via `private.is_admin()` (the `private` schema isn't exposed through the Data API, so keep `SECURITY DEFINER` helpers there). Only assign it through trusted channels such as the SQL Editor, never from the browser.

## Status

Milestones 1–3 are done: scaffold, design system, public pages with example content, payment interface, the Supabase schema with RLS, and Supabase Auth (register with email confirmation, login, logout, password reset; `lib/auth/`, `app/auth/confirm`; `proxy.js` redirects signed-out users away from `/dashboard`, `/admin`, `/reset-password/update`, and pages re-check via `getCurrentUser()`). Admins can create and edit courses and their dates (sessions with max seats) at `/admin/courses`. The home page's "Selected offers" (newest 3), `/courses`, `/courses/[slug]` and `/live-coaching` read published courses from Supabase via `lib/courses/public.js` (cookie-less client, `"use cache"` with tag `courses`, invalidated by the admin actions); signed-in users additionally see "x/max seats reserved". `data/sample-courses.js` is now only used for its formatting helpers (`formatPrice`, `formatSessionRange`). The following are still **UI shells or not started**: real bookings, payment flow and webhooks, the customer dashboard, the admin area, and real legal pages (imprint, privacy, terms and withdrawal are placeholders). See the milestone table in IMPLEMENTATION.md.

## Styling

- CSS Modules plus global design tokens in [app/globals.css](app/globals.css). Use the CSS variables (`--color-*`, `--space-*`, `--text-*`, `--radius-*`) instead of hard-coded values. Global utility classes: `.container`, `.section`, `.section-tight`, `.eyebrow`, `.lead`.
- The palette is warm earth tones (sand, clay, espresso, with an olive accent), inspired by zen-yogi.co with its blues replaced by browns. Don't introduce cool blue accents.
- Fonts come via `next/font/google` in [app/layout.js](app/layout.js): Cormorant Garamond for display (`--font-display`) and Outfit for body (`--font-body`).
