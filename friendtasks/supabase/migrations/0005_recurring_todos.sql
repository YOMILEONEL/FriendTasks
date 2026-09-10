-- Adds optional recurrence to todos. A recurring todo is a single row;
-- completing it (see toggleTodoStatus) creates the next occurrence as a
-- fresh row with the due date advanced by one interval. There is no
-- background job: the next instance only appears once the current one is
-- marked done, matching how Todoist-style recurring tasks behave.

alter table public.todos add column recurrence text check (recurrence in ('weekly', 'monthly'));
