-- Phase 3 collaboration features: realtime updates (FR-15), in-app
-- notifications incl. bundling (FR-18/FR-19/FR-34), a per-group activity
-- log (FR-17), comments (FR-20), claimable/no-fixed-owner todos (FR-36),
-- file attachments (FR-26), and group/list notes (FR-35).

-- =========================================================================
-- Notifications (FR-18/FR-19)
-- =========================================================================

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('assigned', 'comment')),
  todo_id uuid references public.todos (id) on delete cascade,
  group_id uuid references public.groups (id) on delete cascade,
  list_id uuid references public.lists (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications_select_own" on public.notifications
  for select using (user_id = auth.uid());

create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid());

-- No insert/delete policy for clients: every notification is created by the
-- security-definer triggers below, which bypass RLS, so nobody can insert a
-- notification "as" someone else via the API.

-- =========================================================================
-- Activity log (FR-17)
-- =========================================================================

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null check (
    action in (
      'todo_created', 'todo_completed', 'todo_deleted',
      'member_joined', 'member_left',
      'list_created', 'list_deleted'
    )
  ),
  detail text,
  created_at timestamptz not null default now()
);

create index activity_log_group_id_idx on public.activity_log (group_id, created_at desc);

alter table public.activity_log enable row level security;

create policy "activity_log_select" on public.activity_log
  for select using (public.is_group_member(group_id));

-- =========================================================================
-- Comments (FR-20)
-- =========================================================================

create table public.todo_comments (
  id uuid primary key default gen_random_uuid(),
  todo_id uuid not null references public.todos (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index todo_comments_todo_id_idx on public.todo_comments (todo_id);

alter table public.todo_comments enable row level security;

create policy "todo_comments_select" on public.todo_comments
  for select using (
    exists (
      select 1 from public.todos
      where todos.id = todo_comments.todo_id
        and (
          todos.owner_id = auth.uid()
          or (todos.group_id is not null and public.is_group_member(todos.group_id))
          or (todos.list_id is not null and public.is_list_member(todos.list_id))
        )
    )
  );

create policy "todo_comments_insert" on public.todo_comments
  for insert with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.todos
      where todos.id = todo_comments.todo_id
        and (
          todos.owner_id = auth.uid()
          or (todos.group_id is not null and public.is_group_member(todos.group_id))
          or (todos.list_id is not null and public.is_list_member(todos.list_id))
        )
    )
  );

create policy "todo_comments_delete_own" on public.todo_comments
  for delete using (author_id = auth.uid());

-- =========================================================================
-- Triggers: notifications on assignment / comment, activity log entries
-- =========================================================================

create function public.notify_on_assignment()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.user_id = auth.uid() then
    return new;
  end if;
  insert into public.notifications (user_id, type, todo_id, actor_id, message)
  select new.user_id, 'assigned', new.todo_id, auth.uid(), todos.title
  from public.todos where todos.id = new.todo_id;
  return new;
end;
$$;

create trigger on_todo_assignee_added
  after insert on public.todo_assignees
  for each row execute function public.notify_on_assignment();

create function public.notify_on_comment()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  todo_owner uuid;
  recipient uuid;
begin
  select owner_id into todo_owner from public.todos where id = new.todo_id;

  if todo_owner is not null and todo_owner != new.author_id then
    insert into public.notifications (user_id, type, todo_id, actor_id, message)
    values (todo_owner, 'comment', new.todo_id, new.author_id, left(new.content, 140));
  end if;

  for recipient in
    select user_id from public.todo_assignees
    where todo_id = new.todo_id
      and user_id != new.author_id
      and (todo_owner is null or user_id != todo_owner)
  loop
    insert into public.notifications (user_id, type, todo_id, actor_id, message)
    values (recipient, 'comment', new.todo_id, new.author_id, left(new.content, 140));
  end loop;

  return new;
end;
$$;

create trigger on_todo_comment_added
  after insert on public.todo_comments
  for each row execute function public.notify_on_comment();

create function public.log_todo_activity()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    if new.group_id is not null then
      insert into public.activity_log (group_id, actor_id, action, detail)
      values (new.group_id, auth.uid(), 'todo_created', new.title);
    end if;
    return new;
  elsif TG_OP = 'UPDATE' then
    if new.group_id is not null and old.status = 'open' and new.status = 'done' then
      insert into public.activity_log (group_id, actor_id, action, detail)
      values (new.group_id, auth.uid(), 'todo_completed', new.title);
    end if;
    return new;
  elsif TG_OP = 'DELETE' then
    if old.group_id is not null then
      insert into public.activity_log (group_id, actor_id, action, detail)
      values (old.group_id, auth.uid(), 'todo_deleted', old.title);
    end if;
    return old;
  end if;
  return null;
end;
$$;

create trigger todos_activity_log
  after insert or update or delete on public.todos
  for each row execute function public.log_todo_activity();

create function public.log_member_activity()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    insert into public.activity_log (group_id, actor_id, action)
    values (new.group_id, new.user_id, 'member_joined');
    return new;
  elsif TG_OP = 'DELETE' then
    insert into public.activity_log (group_id, actor_id, action)
    values (old.group_id, auth.uid(), 'member_left');
    return old;
  end if;
  return null;
end;
$$;

create trigger group_members_activity_log
  after insert or delete on public.group_members
  for each row execute function public.log_member_activity();

create function public.log_list_activity()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if TG_OP = 'INSERT' and new.group_id is not null then
    insert into public.activity_log (group_id, actor_id, action, detail)
    values (new.group_id, auth.uid(), 'list_created', new.name);
  elsif TG_OP = 'DELETE' and old.group_id is not null then
    insert into public.activity_log (group_id, actor_id, action, detail)
    values (old.group_id, auth.uid(), 'list_deleted', old.name);
  end if;
  if TG_OP = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger lists_activity_log
  after insert or delete on public.lists
  for each row execute function public.log_list_activity();

-- =========================================================================
-- Claimable todos: "von irgendjemandem erledigbar", no fixed assignee (FR-36)
-- =========================================================================

alter table public.todos add column claimable boolean not null default false;

-- =========================================================================
-- Group/list notes (FR-35)
-- =========================================================================

create table public.group_notes (
  group_id uuid primary key references public.groups (id) on delete cascade,
  content text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.group_notes enable row level security;

create policy "group_notes_all" on public.group_notes
  for all using (public.is_group_member(group_id));

create trigger group_notes_set_updated_at
  before update on public.group_notes
  for each row execute function public.set_updated_at();

create table public.list_notes (
  list_id uuid primary key references public.lists (id) on delete cascade,
  content text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.list_notes enable row level security;

create policy "list_notes_all" on public.list_notes
  for all using (public.is_list_member(list_id));

create trigger list_notes_set_updated_at
  before update on public.list_notes
  for each row execute function public.set_updated_at();

-- =========================================================================
-- File attachments (FR-26)
-- =========================================================================

create table public.todo_attachments (
  id uuid primary key default gen_random_uuid(),
  todo_id uuid not null references public.todos (id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  file_size bigint,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index todo_attachments_todo_id_idx on public.todo_attachments (todo_id);

alter table public.todo_attachments enable row level security;

create policy "todo_attachments_meta_all" on public.todo_attachments
  for all using (
    exists (
      select 1 from public.todos
      where todos.id = todo_attachments.todo_id
        and (
          todos.owner_id = auth.uid()
          or (todos.group_id is not null and public.is_group_member(todos.group_id))
          or (todos.list_id is not null and public.is_list_member(todos.list_id))
        )
    )
  );

insert into storage.buckets (id, name, public)
values ('todo-attachments', 'todo-attachments', false)
on conflict (id) do nothing;

-- Objects are stored at "<todo_id>/<random>-<filename>"; storage.foldername
-- splits the path so (storage.foldername(name))[1] is the todo_id.
create policy "todo_attachments_object_select" on storage.objects
  for select using (
    bucket_id = 'todo-attachments'
    and exists (
      select 1 from public.todos
      where todos.id::text = (storage.foldername(name))[1]
        and (
          todos.owner_id = auth.uid()
          or (todos.group_id is not null and public.is_group_member(todos.group_id))
          or (todos.list_id is not null and public.is_list_member(todos.list_id))
        )
    )
  );

create policy "todo_attachments_object_insert" on storage.objects
  for insert with check (
    bucket_id = 'todo-attachments'
    and exists (
      select 1 from public.todos
      where todos.id::text = (storage.foldername(name))[1]
        and (
          todos.owner_id = auth.uid()
          or (todos.group_id is not null and public.is_group_member(todos.group_id))
          or (todos.list_id is not null and public.is_list_member(todos.list_id))
        )
    )
  );

create policy "todo_attachments_object_delete" on storage.objects
  for delete using (
    bucket_id = 'todo-attachments'
    and exists (
      select 1 from public.todos
      where todos.id::text = (storage.foldername(name))[1]
        and (
          todos.owner_id = auth.uid()
          or (todos.group_id is not null and public.is_group_member(todos.group_id))
          or (todos.list_id is not null and public.is_list_member(todos.list_id))
        )
    )
  );

-- =========================================================================
-- Realtime (FR-15): Supabase applies RLS to postgres_changes subscriptions,
-- so a client that subscribes to "todos"/"notifications" only ever receives
-- rows it could also have selected — no per-user filter needed here.
-- =========================================================================

do $$
begin
  alter publication supabase_realtime add table public.todos;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
