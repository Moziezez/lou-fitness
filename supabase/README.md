# Supabase-Datenbankschema

Projekt: `eydfotinnemasvrwntpa` (siehe `.mcp.json`). Beide Migrationen sind dort
angewendet (Stand 2026-10-21) und in der Migrationshistorie des Projekts
eingetragen.

| Datei | Inhalt |
|---|---|
| [`0001_init.sql`](./migrations/0001_init.sql) | Tabellen `profiles`, `courses`, `sessions`, `bookings`, `payments`, Indizes, Schema `private` mit `is_admin()`, `set_updated_at()`-Trigger, Profil-Anlage bei Registrierung, RLS und Spaltenrechte |
| [`0002_merge_read_policies.sql`](./migrations/0002_merge_read_policies.sql) | Fasst je Tabelle die Lese-Policies (eigene/veröffentlichte + Admin) zu einer zusammen; gleiche Rechte, bessere Performance |

## Zugriffsmodell

- **Nur Lesen** für `anon`/`authenticated`. Es gibt keine INSERT-, UPDATE- oder
  DELETE-Rechte; Schreibpfade laufen später über Servercode mit expliziter
  Autorisierung (Service-Role-Client oder eng begrenzte Policies).
- `anon` sieht veröffentlichte Kurse und veröffentlichte Termine
  veröffentlichter Kurse. Angemeldete Nutzer sehen zusätzlich ihr eigenes
  Profil und ihre eigenen Buchungen. Zahlungen sieht nur der Admin.
- `meeting_url` ist per Spaltenrecht für `anon` und `authenticated` gesperrt.
- Admin = `profiles.role = 'admin'`, geprüft über `private.is_admin()`. Das
  Schema `private` ist nicht über die Data API erreichbar, die
  `SECURITY DEFINER`-Funktionen sind also nicht als RPC aufrufbar.
- Bei jeder Registrierung legt der Trigger `on_auth_user_created` ein Profil mit
  Rolle `customer` an. `full_name` kommt aus `raw_user_meta_data` (vom Nutzer
  änderbar, daher nur Anzeige); die Rolle wird **nie** aus Metadaten übernommen.

Geprüft mit einem zurückgerollten RLS-Test (anon / Kunde / Admin) und den
Supabase-Advisors (Security: keine Befunde).

## Ersten Admin festlegen

Nachdem sich der Account registriert hat, im SQL Editor ausführen:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'lou@example.com');
```

Die Rolle niemals aus dem Browser heraus änderbar machen.

## Neue Änderungen

Angewendete Migrationen nicht mehr bearbeiten. Für Änderungen eine neue Datei
`000N_<name>.sql` anlegen, über den SQL Editor oder das Supabase-MCP
(`apply_migration`) anwenden und danach die Advisors prüfen.

## Noch offen

- Freie Plätze pro Termin: `anon` kann `bookings` nicht lesen. Für die
  öffentliche Anzeige braucht es eine Zählfunktion bzw. View (Meilenstein 4).
- Webhook-Idempotenz über `eventId` (eigene Event-Tabelle, Meilenstein 5);
  `(provider, external_reference)` ist bereits eindeutig.
- Kunden sehen ihre eigenen Zahlungen noch nicht (Dashboard, Meilenstein 6).
