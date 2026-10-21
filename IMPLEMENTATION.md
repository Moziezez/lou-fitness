# Lou Fitness — Implementierungsplan

Personal-Coaching-Plattform für **Lou Shine** (Kingston, Jamaica).  
Online-Kurse und Live-Coaching mit festen Terminen, Registrierung, Buchung und Vorauszahlung.

## Zahlungsanbieter — Recherche (Stand Setup)

### WiPay Caribbean ([wipaycaribbean.com](https://wipaycaribbean.com)) — gewählter Anbieter

- Karibischer Zahlungsdienstleister mit eigener Jamaika-Instanz (`jm.wipayfinancial.com`), JMD und USD.
- **Hosted Checkout:** Server sendet `POST https://jm.wipayfinancial.com/plugins/payments/request`
  (u. a. `account_number`, `country_code=JM`, `currency`, `environment=sandbox|live`, `fee_structure`,
  `method=credit_card`, `order_id`, `origin`, `response_url`, `total` mit 2 Nachkommastellen) → Antwort enthält `url` → Redirect.
- **Rückmeldung:** WiPay leitet auf `response_url` zurück mit `status`, `order_id`, `transaction_id`, `total`, `hash`.
  Prüfung serverseitig: `hash === md5(transaction_id + total + API_KEY)` (timing-safe), danach Betrag/Währung gegen die DB abgleichen.
- Kartendaten bleiben vollständig bei WiPay (kein PCI-Scope bei uns).
- Sandbox über `environment=sandbox`; Live-Zugang erfordert ein verifiziertes WiPay-Business-Konto (Developer-Bereich im Dashboard).
- Bekannte Eigenheit: WiPay hängt Parameter teils fehlerhaft an eine `response_url` mit vorhandenem Query-String an → `response_url` ohne Query bauen, Zuordnung über `order_id`.

### Architekturentscheidung

Austauschbare Schnittstelle unter `lib/payments/`:

| Provider | Status                                       |
|----------|----------------------------------------------|
| `test`   | Entwicklungsmodus (klar gekennzeichnet)      |
| `wipay`  | Adapter-Stub vorbereitet, Implementierung + Credentials fehlen |

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
- WiPay-Business-Konto (Jamaika): Account Number + API Key (Sandbox und Live)
- Domain / Vercel-Projekt
- Echtes Impressum / Datenschutz (aktuell nur Platzhalter)

## Designrichtung

- Erdige Brauntöne, Sand, Creme; Espresso für Text/Buttons; dezentes Oliv.
- Inspiration [Zen Yogi](https://zen-yogi.co/): ruhige Wellness-Ästhetik; Blau durch helles Braun ersetzt.
- Schriften: Cormorant Garamond (Display/Brand), Outfit (UI/Body) — elegante, weiche Wellness-Typografie im Stil der Referenz.
