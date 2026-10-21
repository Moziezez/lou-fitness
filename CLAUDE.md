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
- `lib/payments/`: a swappable provider interface. `getPaymentProvider()` picks `test`, `paynowpro` or `fygaro` from `PAYMENT_PROVIDER` (default `test`). Each provider implements `createCheckout`, `verifyWebhook` and `getPaymentStatus`. The PayNowPro and Fygaro adapters are stubs that throw until credentials exist.
- `supabase/migrations/`: `0001_init.sql` creates the tables `profiles`, `courses`, `sessions`, `bookings` and `payments`, the `private` helper schema, `updated_at` triggers, the profile-on-signup trigger and RLS. `0002_merge_read_policies.sql` merges the per-table SELECT policies. Both are applied to project `eydfotinnemasvrwntpa` (via the Supabase MCP in `.mcp.json`; no local CLI stack). Once a migration has been applied, don't edit it; add a new forward migration instead.

### Known model mismatch

The sample data doesn't match the DB schema yet, so map the fields when you switch pages to Supabase:

| Sample data | DB |
|---|---|
| `priceCents` (payment types also use `amountCents`) | `price_minor_units`, `amount_minor_units` |
| `format: "group" \| "online"` | `format in ('online_course','live_coaching')` |
| `seatsTaken` | not stored; derive it from `bookings` |

## Invariants (security and payments)

- **A test payment never counts as paid.** The test provider returns `status: "simulated"` and `isAuthoritative: false`. Course access must never be unlocked from it.
- Unlock access only after a **server-verified webhook** (signature check, idempotent on `eventId` / `(provider, external_reference)`). Never unlock from the success/return URL alone.
- Always load prices on the server from the DB. Never trust amounts sent by the client.
- Keep booking status (`pending/confirmed/cancelled`) and payment status (`pending/succeeded/failed/simulated/refunded`) separate.
- Never store or handle card data. Provider secrets belong in server env vars only (never `NEXT_PUBLIC_*`).
- The RLS in the migration is deliberately **read-only** for `anon`/`authenticated`, and `meeting_url` is hidden from both. Add write paths through server code with explicit authorization checks and narrowly scoped policies. Admin is decided by `profiles.role = 'admin'` via `private.is_admin()` (the `private` schema isn't exposed through the Data API, so keep `SECURITY DEFINER` helpers there). Only assign it through trusted channels such as the SQL Editor, never from the browser.

## Status

Milestones 1 and 2 are done: scaffold, design system, public pages with example content, payment interface, and the Supabase schema with RLS, applied and tested. The pages still read from `data/sample-courses.js`. The following are still **UI shells or not started**: Supabase Auth on login/register/reset, real bookings, payment flow and webhooks, the customer dashboard, the admin area, and real legal pages (imprint, privacy, terms and withdrawal are placeholders). See the milestone table in IMPLEMENTATION.md.

## Styling

- CSS Modules plus global design tokens in [app/globals.css](app/globals.css). Use the CSS variables (`--color-*`, `--space-*`, `--text-*`, `--radius-*`) instead of hard-coded values. Global utility classes: `.container`, `.section`, `.section-tight`, `.eyebrow`, `.lead`.
- The palette is warm earth tones (sand, clay, espresso, with an olive accent), inspired by zen-yogi.co with its blues replaced by browns. Don't introduce cool blue accents.
- Fonts come via `next/font/google` in [app/layout.js](app/layout.js): Cormorant Garamond for display (`--font-display`) and Outfit for body (`--font-body`).
