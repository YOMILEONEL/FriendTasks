-- Adds an optional end time so a todo can span a time range (e.g. 09:00-11:00)
-- instead of only a single start time.

alter table public.todos add column due_time_end time;

alter table public.todos add constraint todos_time_range_check
  check (due_time_end is null or (due_time is not null and due_time_end > due_time));
