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

## PayNowPro

- Intent anlegen → Redirect → Webhook `standardTransaction` (u. a.).
- Docs: https://paynowpro.com/docs/concepts/payment-intent

## Fygaro

- JWT-gesicherter Button-Link oder Query-Parameter.
- Hook mit `Fygaro-Signature` verifizieren.
- Docs: https://help.fygaro.com/en-us/article/fygaro-links-integration-api-h78p9y/
