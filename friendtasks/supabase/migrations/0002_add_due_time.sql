-- Adds an optional time-of-day to todos, alongside the existing due_date.
-- Nullable and additive: existing rows keep due_time = null (shown as
-- "all-day" in the calendar week view) and need no backfill.

alter table public.todos add column due_time time;
