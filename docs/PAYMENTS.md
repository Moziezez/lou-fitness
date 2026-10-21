# Zahlungsintegration

## Prinzipien

1. Preise immer serverseitig aus der Datenbank laden.
2. Buchungsstatus und Zahlungsstatus getrennt führen.
3. Freischaltung nur nach serverseitig verifizierter Zahlung (Webhook), nie allein über Success-URL.
4. Webhooks: Signatur prüfen, idempotent verarbeiten.
5. Keine Kartendaten speichern oder verarbeiten.
6. Secrets nur in Server-Umgebungsvariablen.

## Provider-Interface

Siehe `lib/payments/types.js` und `lib/payments/index.js`.

```text
createCheckout({ booking, course, session, user, returnUrls })
  → { checkoutUrl, providerPaymentId, mode }

verifyWebhook(request)
  → { eventId, status, bookingId, amount, currency, raw }

getPaymentStatus(providerPaymentId)
  → { status, amount, currency }
```

## Aktueller Modus

`PAYMENT_PROVIDER=test` startet einen **klar gekennzeichneten** Entwicklungsablauf.
Testzahlungen setzen den Status auf `simulated` / `pending_review` — **nicht** auf `paid`.

## WiPay (`PAYMENT_PROVIDER=wipay`)

Adapter: `lib/payments/providers/wipay.js` (Stub, wird im nächsten Schritt implementiert).

Ablauf:

1. Server legt `bookings` (`pending`) und `payments` (`pending`, Betrag aus der DB) an.
2. Server sendet `POST https://jm.wipayfinancial.com/plugins/payments/request` (form-encoded) mit
   `account_number`, `country_code=JM`, `currency` (JMD/USD), `environment` (`sandbox`/`live`),
   `fee_structure` (`customer_pay` | `merchant_absorb` | `split`), `method=credit_card`,
   `order_id` (= `payments.id`), `origin`, `response_url`, `total` (z. B. `"15000.00"`),
   optional `name`, `email`, `phone`, `data`.
3. Antwort enthält `url` → Redirect des Kunden zum gehosteten WiPay-Checkout.
4. WiPay leitet auf `response_url` zurück mit `status` (`success`/`failed`/`error`),
   `order_id`, `transaction_id`, `total`, `hash`, `message`.
5. Route-Handler prüft serverseitig `hash === md5(transaction_id + total + WIPAY_API_KEY)`
   (timing-safe; `total` ggf. auf 2 Nachkommastellen normalisieren), gleicht `order_id`,
   Betrag und Währung mit der `payments`-Zeile ab und verarbeitet idempotent über
   `(provider, external_reference = transaction_id)`.
6. Erst dann `payments.status = succeeded` und `bookings.status = confirmed`.

Hinweise:

- WiPay hat keinen klassischen signierten Webhook; die Rückleitung auf `response_url` ist der
  Verifikationspunkt. Sie ist nur gültig, wenn der Hash serverseitig geprüft wurde — niemals den
  Query-Parametern ohne Hash-Prüfung vertrauen. Ist ein Server-zu-Server-Callback im
  WiPay-Dashboard verfügbar, diesen zusätzlich nutzen.
- `response_url` ohne eigenen Query-String bauen (WiPay hängt Parameter sonst fehlerhaft an).
- Env-Variablen: `WIPAY_ACCOUNT_NUMBER`, `WIPAY_API_KEY`, `WIPAY_ENVIRONMENT`,
  `WIPAY_REQUEST_URL`, `WIPAY_FEE_STRUCTURE` (nur serverseitig).
- Details der Live-API im Developer-Bereich des WiPay-Dashboards bestätigen, sobald das Konto verifiziert ist.
