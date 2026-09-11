-- Two calendar-related gaps:
--
-- 1. Recurring todos had no end date ("repeat until"): once set to weekly/
--    monthly they repeated forever. Adds an optional recurrence_until.
--
-- 2. Completing a recurring todo advances the same row's due_date to the
--    next occurrence (see 0005/lib/actions/todos.ts toggleTodoStatus), so
--    the row itself no longer sits on the date that was just completed —
--    the calendar had nothing to show there anymore. todo_occurrence_
--    completions records that history so the calendar can still render a
--    struck-through chip on the date that was actually completed.

alter table public.todos add column recurrence_until date;

alter table public.todos add constraint todos_recurrence_until_check
  check (
    recurrence_until is null
    or (recurrence is not null and due_date is not null and recurrence_until >= due_date)
  );

create table public.todo_occurrence_completions (
  todo_id uuid not null references public.todos (id) on delete cascade,
  occurrence_date date not null,
  completed_at timestamptz not null default now(),
  primary key (todo_id, occurrence_date)
);

create index todo_occurrence_completions_date_idx on public.todo_occurrence_completions (occurrence_date);

alter table public.todo_occurrence_completions enable row level security;

create policy "todo_occurrence_completions_all" on public.todo_occurrence_completions
  for all using (
    exists (
      select 1 from public.todos
      where todos.id = todo_occurrence_completions.todo_id
        and (
          todos.owner_id = auth.uid()
          or (todos.group_id is not null and public.is_group_member(todos.group_id))
          or (todos.list_id is not null and public.is_list_member(todos.list_id))
        )
    )
  );

do $$
begin
  alter publication supabase_realtime add table public.todo_occurrence_completions;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
