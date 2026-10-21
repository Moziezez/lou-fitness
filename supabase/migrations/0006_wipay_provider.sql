-- Replace PayNowPro/Fygaro with WiPay as the only live payment provider.
-- Fails if payments rows with provider 'paynowpro' or 'fygaro' exist (none expected: no live flow yet).

alter table public.payments
  drop constraint if exists payments_provider_check;

alter table public.payments
  add constraint payments_provider_check
  check (provider in ('test', 'wipay'));
