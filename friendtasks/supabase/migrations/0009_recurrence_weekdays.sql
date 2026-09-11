-- A weekly recurring todo could previously only repeat on the single
-- weekday of its due_date (e.g. "every Monday"). Adds an optional set of
-- weekdays so a todo can recur multiple times a week (e.g. Monday AND
-- Thursday). NULL keeps the old behavior: repeat on due_date's own weekday.
-- Values are ISO-ish JS Date#getDay() numbers (0 = Sunday .. 6 = Saturday).

alter table public.todos add column recurrence_weekdays smallint[];

alter table public.todos add constraint todos_recurrence_weekdays_check
  check (
    recurrence_weekdays is null
    or (
      recurrence = 'weekly'
      and array_length(recurrence_weekdays, 1) > 0
      and recurrence_weekdays <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]
    )
  );
