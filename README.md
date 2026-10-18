# Lou Fitness

Personal coaching platform for **Lou Shine** (Kingston, Jamaica / Cherry Gardens).  
Next.js (App Router, JavaScript) · Supabase · swappable payments (PayNowPro / Fygaro / test).

## Current status (Milestone 1)

- Next.js app scaffold and folder structure
- Warm earth-tone design system (CSS variables + CSS Modules)
- Public pages with **example** content
- Payment provider interface + adapters (test live; PayNowPro/Fygaro stubs)
- Draft SQL schema under `supabase/migrations/`

**Not yet:** live Supabase Auth, real bookings, confirmed payments, customer/admin dashboards.

See [IMPLEMENTATION.md](./IMPLEMENTATION.md) and [docs/PAYMENTS.md](./docs/PAYMENTS.md).

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.example` → `.env.local`. Never commit secrets.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_*` | Browser-safe Supabase keys |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only |
| `PAYMENT_PROVIDER` | `test` \| `paynowpro` \| `fygaro` |
| Provider secrets | See `.env.example` |

## Design

Inspired by [Zen Yogi](https://zen-yogi.co/)’s calm wellness layout. Cool blues are replaced with light clay/sand browns. Display font: Cormorant Garamond · UI font: Outfit.

## Deploy (Vercel)

1. Push to Git and import the repo in Vercel.
2. Set environment variables from `.env.example`.
3. Deploy. Add webhook URLs pointing to your production domain once payments are configured.

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run start` — serve build
- `npm run lint` — ESLint
