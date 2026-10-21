-- Dates are entered with a start time only. Existing end times are kept;
-- the check (ends_at > starts_at) still applies whenever an end is set.

alter table public.sessions
  alter column ends_at drop not null;
