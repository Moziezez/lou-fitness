# Lou Fitness — Implementierungsplan

Personal-Coaching-Plattform für **Lou Shine** (Kingston, Jamaica / Cherry Gardens).  
Online-Kurse und Live-Coaching mit festen Terminen, Registrierung, Buchung und Vorauszahlung.

## Zahlungsanbieter — Recherche (Stand Setup)

### PayNowPro ([Docs](https://paynowpro.com/docs)) — empfohlen als Primärziel

- Jamaika-basiert, REST API über Powertranz (`https://api.paynowpro.com/api/v1`, Header `api-key`).
- **Payment Intents:** Server erstellt Intent → Redirect zum gehosteten Checkout → Return-URL.
- **Webhooks:** u. a. `standardTransaction`, `collect`, `reversal` (Signatur-Details in der Provider-Doku zu bestätigen, sobald Keys vorliegen).
- Passt geografisch und fachlich gut zu Lou Shine (Kingston).

### Fygaro ([Links API](https://help.fygaro.com/en-us/article/fygaro-links-integration-api-h78p9y/), [Hooks](https://help.fygaro.com/en-us/article/payment-button-hook-1wkui1k/))

- Checkout über Payment Buttons / Links; Beträge per Query oder **JWT (HS256)** (Pro-Plan).
- **Webhooks:** `Fygaro-Signature` + `Fygaro-Key-ID`, HMAC-SHA256 über `timestamp.rawBody`, Replay-Fenster ~300s.
- Payload u. a. `transactionId`, `customReference`, `amount`, `currency`.
- Node-Helper: `@fygaro/webhook`.

### Architekturentscheidung

Austauschbare Schnittstelle unter `lib/payments/`:

| Provider   | Status                                      |
|------------|---------------------------------------------|
| `test`     | Entwicklungsmodus (klar gekennzeichnet)     |
| `paynowpro`| Adapter vorbereitet, Credentials fehlen     |
| `fygaro`   | Adapter vorbereitet, Credentials fehlen     |

Simulierte Testzahlungen gelten **niemals** als echte, bestätigte Zahlungen.

## Meilensteine

| # | Schritt                         | Status        |
|---|---------------------------------|---------------|
| 1 | Repo, Struktur, Design, Public  | **erledigt**  |
| 2 | Supabase-Schema + RLS           | **erledigt**  |
| 3 | Auth + geschützte Bereiche      | **erledigt**  |
| 4 | Kurse, Termine, Buchungen       | ausstehend    |
| 5 | Zahlungsflow + Webhooks         | ausstehend    |
| 6 | Kunden-Dashboard                | ausstehend    |
| 7 | Admin-Bereich                   | ausstehend    |
| 8 | Security-Pass, Fehler, Deploy   | ausstehend    |

## Zielstruktur

```
app/
  (public)/          # Startseite, About, Kurse, Live, Kontakt, Legal
  (auth)/            # Login, Register, Reset
  (customer)/        # Dashboard (geschützt)
  (admin)/           # Admin (geschützt, Rolle admin)
  api/               # Bookings, Webhooks, Contact
components/          # Layout, UI, Course-Karten
lib/
  supabase/          # Browser-, Server-, Admin-Clients
  auth/              # Session, Rollen
  bookings/          # Verfügbarkeit, Idempotenz
  payments/          # Provider-Interface + Adapter
data/                # Beispieldaten (bis DB live)
supabase/migrations/ # SQL-Schema + RLS
```

## Offene Voraussetzungen

- Supabase-Projekt (URL, anon key, service role)
- PayNowPro- oder Fygaro-API-Credentials + Webhook-Secret
- Domain / Vercel-Projekt
- Echtes Impressum / Datenschutz (aktuell nur Platzhalter)

## Designrichtung

- Erdige Brauntöne, Sand, Creme; Espresso für Text/Buttons; dezentes Oliv.
- Inspiration [Zen Yogi](https://zen-yogi.co/): ruhige Wellness-Ästhetik; Blau durch helles Braun ersetzt.
- Schriften: Cormorant Garamond (Display/Brand), Outfit (UI/Body) — elegante, weiche Wellness-Typografie im Stil der Referenz.
