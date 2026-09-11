-- Four related permission/workflow changes:
--
-- 1. A friend invited to a personal list can view it but not create,
--    edit, or delete todos there — only the list owner can write.
-- 2. In a group, only an admin can delete any todo; a regular member can
--    only delete todos they created themselves.
-- 3. Assignment/comment notifications didn't carry group_id/list_id, so
--    clicking one always fell through to /all instead of the actual group
--    or list the todo lives in.
-- 4. Joining a group or personal list via invite link no longer adds the
--    person immediately — it creates a pending request that the group
--    admin (or list owner) must approve, invisible to other members.

-- =========================================================================
-- 1. Read-only personal-list members
-- =========================================================================

-- Who can *write* to a list's todos: the personal-list owner, or any member
-- of the group a sub-list belongs to. Deliberately narrower than
-- is_list_member (used for read access), which also includes a personal
-- list's invited-but-not-owner members.
create function public.is_list_editor(target_list_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.lists l
    where l.id = target_list_id
      and (
        l.owner_id = auth.uid()
        or (l.group_id is not null and public.is_group_member(l.group_id))
      )
  );
$$;

drop policy "todos_insert" on public.todos;
create policy "todos_insert" on public.todos
  for insert with check (
    owner_id = auth.uid()
    and (group_id is null or public.is_group_member(group_id))
    and (list_id is null or public.is_list_editor(list_id))
  );

drop policy "todos_update" on public.todos;
create policy "todos_update" on public.todos
  for update using (
    owner_id = auth.uid()
    or (group_id is not null and public.is_group_member(group_id))
    or (list_id is not null and public.is_list_editor(list_id))
  );

drop policy "subtasks_all" on public.subtasks;
create policy "subtasks_select" on public.subtasks
  for select using (
    exists (
      select 1 from public.todos
      where todos.id = subtasks.todo_id
        and (
          todos.owner_id = auth.uid()
          or (todos.group_id is not null and public.is_group_member(todos.group_id))
          or (todos.list_id is not null and public.is_list_member(todos.list_id))
        )
    )
  );
create policy "subtasks_insert" on public.subtasks
  for insert with check (
    exists (
      select 1 from public.todos
      where todos.id = subtasks.todo_id
        and (
          todos.owner_id = auth.uid()
          or (todos.group_id is not null and public.is_group_member(todos.group_id))
          or (todos.list_id is not null and public.is_list_editor(todos.list_id))
        )
    )
  );
create policy "subtasks_update" on public.subtasks
  for update using (
    exists (
      select 1 from public.todos
      where todos.id = subtasks.todo_id
        and (
          todos.owner_id = auth.uid()
          or (todos.group_id is not null and public.is_group_member(todos.group_id))
          or (todos.list_id is not null and public.is_list_editor(todos.list_id))
        )
    )
  );
create policy "subtasks_delete" on public.subtasks
  for delete using (
    exists (
      select 1 from public.todos
      where todos.id = subtasks.todo_id
        and (
          todos.owner_id = auth.uid()
          or (todos.group_id is not null and public.is_group_member(todos.group_id))
          or (todos.list_id is not null and public.is_list_editor(todos.list_id))
        )
    )
  );

drop policy "todo_tags_all" on public.todo_tags;
create policy "todo_tags_select" on public.todo_tags
  for select using (
    exists (
      select 1 from public.todos
      where todos.id = todo_tags.todo_id
        and (
          todos.owner_id = auth.uid()
          or (todos.group_id is not null and public.is_group_member(todos.group_id))
          or (todos.list_id is not null and public.is_list_member(todos.list_id))
        )
    )
  );
create policy "todo_tags_insert" on public.todo_tags
  for insert with check (
    exists (
      select 1 from public.todos
      where todos.id = todo_tags.todo_id
        and (
          todos.owner_id = auth.uid()
          or (todos.group_id is not null and public.is_group_member(todos.group_id))
          or (todos.list_id is not null and public.is_list_editor(todos.list_id))
        )
    )
  );
create policy "todo_tags_delete" on public.todo_tags
  for delete using (
    exists (
      select 1 from public.todos
      where todos.id = todo_tags.todo_id
        and (
          todos.owner_id = auth.uid()
          or (todos.group_id is not null and public.is_group_member(todos.group_id))
          or (todos.list_id is not null and public.is_list_editor(todos.list_id))
        )
    )
  );

-- =========================================================================
-- 2. Group todo deletion: admin can delete any, a member only their own
-- =========================================================================

drop policy "todos_delete" on public.todos;
create policy "todos_delete" on public.todos
  for delete using (
    owner_id = auth.uid()
    or (group_id is not null and public.is_group_admin(group_id))
    or (list_id is not null and public.is_list_editor(list_id))
  );

-- =========================================================================
-- 3. Notifications carry group_id/list_id so clicking one can go straight
--    to where the todo actually lives, instead of falling back to /all.
-- =========================================================================

create or replace function public.notify_on_assignment()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.user_id = auth.uid() then
    return new;
  end if;
  insert into public.notifications (user_id, type, todo_id, group_id, list_id, actor_id, message)
  select new.user_id, 'assigned', new.todo_id, todos.group_id, todos.list_id, auth.uid(), todos.title
  from public.todos where todos.id = new.todo_id;
  return new;
end;
$$;

create or replace function public.notify_on_comment()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  todo_owner uuid;
  todo_group_id uuid;
  todo_list_id uuid;
  recipient uuid;
begin
  select owner_id, group_id, list_id into todo_owner, todo_group_id, todo_list_id
  from public.todos where id = new.todo_id;

  if todo_owner is not null and todo_owner != new.author_id then
    insert into public.notifications (user_id, type, todo_id, group_id, list_id, actor_id, message)
    values (todo_owner, 'comment', new.todo_id, todo_group_id, todo_list_id, new.author_id, left(new.content, 140));
  end if;

  for recipient in
    select user_id from public.todo_assignees
    where todo_id = new.todo_id
      and user_id != new.author_id
      and (todo_owner is null or user_id != todo_owner)
  loop
    insert into public.notifications (user_id, type, todo_id, group_id, list_id, actor_id, message)
    values (recipient, 'comment', new.todo_id, todo_group_id, todo_list_id, new.author_id, left(new.content, 140));
  end loop;

  return new;
end;
$$;

-- =========================================================================
-- 4. Join requests: invite links create a pending request instead of
--    instant membership. Only a group admin / list owner can see and
--    decide on requests for their own group/list; the requester is
--    notified once approved.
-- =========================================================================

alter table public.notifications drop constraint notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('assigned', 'comment', 'join_request', 'join_approved'));

create table public.group_join_requests (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (group_id, user_id)
);

alter table public.group_join_requests enable row level security;

create policy "group_join_requests_select" on public.group_join_requests
  for select using (public.is_group_admin(group_id) or user_id = auth.uid());

create policy "group_join_requests_update_admin" on public.group_join_requests
  for update using (public.is_group_admin(group_id));

create policy "group_join_requests_delete_admin" on public.group_join_requests
  for delete using (public.is_group_admin(group_id));

-- No client insert policy: requests are only created via join_group_by_token
-- below (security definer), so a not-yet-member can never insert directly.

create table public.list_join_requests (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (list_id, user_id)
);

alter table public.list_join_requests enable row level security;

create policy "list_join_requests_select" on public.list_join_requests
  for select using (
    exists (select 1 from public.lists where id = list_id and owner_id = auth.uid())
    or user_id = auth.uid()
  );

create policy "list_join_requests_update_owner" on public.list_join_requests
  for update using (
    exists (select 1 from public.lists where id = list_id and owner_id = auth.uid())
  );

create policy "list_join_requests_delete_owner" on public.list_join_requests
  for delete using (
    exists (select 1 from public.lists where id = list_id and owner_id = auth.uid())
  );

-- Notify the group's admin(s) of a new/re-sent request, and the requester
-- once an admin approves it.
create function public.notify_on_group_join_request_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  admin_id uuid;
  requester_name text;
  group_name_val text;
begin
  if (TG_OP = 'INSERT' and new.status = 'pending')
     or (TG_OP = 'UPDATE' and old.status = 'declined' and new.status = 'pending') then
    select display_name into requester_name from public.profiles where id = new.user_id;
    for admin_id in
      select user_id from public.group_members where group_id = new.group_id and role = 'admin'
    loop
      insert into public.notifications (user_id, type, group_id, actor_id, message)
      values (admin_id, 'join_request', new.group_id, new.user_id, requester_name);
    end loop;
  elsif TG_OP = 'UPDATE' and old.status = 'pending' and new.status = 'approved' then
    select name into group_name_val from public.groups where id = new.group_id;
    insert into public.notifications (user_id, type, group_id, actor_id, message)
    values (new.user_id, 'join_approved', new.group_id, auth.uid(), group_name_val);
  end if;
  return new;
end;
$$;

create trigger on_group_join_request_change
  after insert or update on public.group_join_requests
  for each row execute function public.notify_on_group_join_request_change();

create function public.notify_on_list_join_request_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  owner_id_val uuid;
  requester_name text;
  list_name_val text;
begin
  if (TG_OP = 'INSERT' and new.status = 'pending')
     or (TG_OP = 'UPDATE' and old.status = 'declined' and new.status = 'pending') then
    select owner_id into owner_id_val from public.lists where id = new.list_id;
    select display_name into requester_name from public.profiles where id = new.user_id;
    insert into public.notifications (user_id, type, list_id, actor_id, message)
    values (owner_id_val, 'join_request', new.list_id, new.user_id, requester_name);
  elsif TG_OP = 'UPDATE' and old.status = 'pending' and new.status = 'approved' then
    select name into list_name_val from public.lists where id = new.list_id;
    insert into public.notifications (user_id, type, list_id, actor_id, message)
    values (new.user_id, 'join_approved', new.list_id, auth.uid(), list_name_val);
  end if;
  return new;
end;
$$;

create trigger on_list_join_request_change
  after insert or update on public.list_join_requests
  for each row execute function public.notify_on_list_join_request_change();

-- join_group_by_token / join_list_by_token now create a pending request
-- (or no-op if already a member) instead of joining immediately.
create or replace function public.join_group_by_token(token uuid)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  target_group_id uuid;
  already_member boolean;
begin
  select id into target_group_id from public.groups where invite_token = token;
  if target_group_id is null then
    raise exception 'invalid_invite_token';
  end if;

  select exists(
    select 1 from public.group_members where group_id = target_group_id and user_id = auth.uid()
  ) into already_member;
  if already_member then
    return target_group_id;
  end if;

  insert into public.group_join_requests (group_id, user_id, status)
  values (target_group_id, auth.uid(), 'pending')
  on conflict (group_id, user_id) do update
    set status = 'pending', decided_at = null
    where group_join_requests.status = 'declined';

  return target_group_id;
end;
$$;

create or replace function public.join_list_by_token(token uuid)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  target_list_id uuid;
  list_owner uuid;
  already_member boolean;
begin
  select id, owner_id into target_list_id, list_owner
  from public.lists where invite_token = token and owner_id is not null;
  if target_list_id is null then
    raise exception 'invalid_invite_token';
  end if;
  if list_owner = auth.uid() then
    return target_list_id;
  end if;

  select exists(
    select 1 from public.list_members where list_id = target_list_id and user_id = auth.uid()
  ) into already_member;
  if already_member then
    return target_list_id;
  end if;

  insert into public.list_join_requests (list_id, user_id, status)
  values (target_list_id, auth.uid(), 'pending')
  on conflict (list_id, user_id) do update
    set status = 'pending', decided_at = null
    where list_join_requests.status = 'declined';

  return target_list_id;
end;
$$;

-- get_group_preview / get_list_preview now also report the caller's own
-- request status, so the join page can show "request sent" / "already a
-- member" instead of always offering to join again. Return shape changed,
-- so drop + recreate rather than replace.
drop function public.get_group_preview(uuid);
create function public.get_group_preview(token uuid)
returns table(id uuid, name text, member_count bigint, my_status text)
language sql security definer set search_path = public
stable
as $$
  select
    g.id,
    g.name,
    count(distinct gm.user_id),
    case
      when exists (
        select 1 from public.group_members gm2 where gm2.group_id = g.id and gm2.user_id = auth.uid()
      ) then 'member'
      when exists (
        select 1 from public.group_join_requests r
        where r.group_id = g.id and r.user_id = auth.uid() and r.status = 'pending'
      ) then 'pending'
      when exists (
        select 1 from public.group_join_requests r
        where r.group_id = g.id and r.user_id = auth.uid() and r.status = 'declined'
      ) then 'declined'
      else 'none'
    end
  from public.groups g
  left join public.group_members gm on gm.group_id = g.id
  where g.invite_token = token
  group by g.id, g.name;
$$;

drop function public.get_list_preview(uuid);
create function public.get_list_preview(token uuid)
returns table(id uuid, name text, member_count bigint, my_status text)
language sql security definer set search_path = public
stable
as $$
  select
    l.id,
    l.name,
    count(lm.user_id) + 1,
    case
      when l.owner_id = auth.uid() then 'member'
      when exists (
        select 1 from public.list_members lm2 where lm2.list_id = l.id and lm2.user_id = auth.uid()
      ) then 'member'
      when exists (
        select 1 from public.list_join_requests r
        where r.list_id = l.id and r.user_id = auth.uid() and r.status = 'pending'
      ) then 'pending'
      when exists (
        select 1 from public.list_join_requests r
        where r.list_id = l.id and r.user_id = auth.uid() and r.status = 'declined'
      ) then 'declined'
      else 'none'
    end
  from public.lists l
  left join public.list_members lm on lm.list_id = l.id
  where l.invite_token = token and l.owner_id is not null
  group by l.id, l.name, l.owner_id;
$$;
