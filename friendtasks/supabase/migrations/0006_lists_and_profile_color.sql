-- Adds "lists": sub-lists within a group (FR-25), and personal lists that
-- can be shared with individual friends via invite link, independent of
-- group management (FR-29/FR-30). A list belongs to exactly one of
-- owner_id (personal list) or group_id (group sub-list) — never both.
-- Also adds a profile color for visual recognition in member lists (FR-3).

create table public.lists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references public.profiles (id) on delete cascade,
  group_id uuid references public.groups (id) on delete cascade,
  invite_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  constraint lists_owner_xor_group check (
    (owner_id is not null and group_id is null) or (owner_id is null and group_id is not null)
  )
);

-- Personal-list members only (a friend the owner invited). Group sub-list
-- membership is inherited from group_members instead — see is_list_member.
create table public.list_members (
  list_id uuid not null references public.lists (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (list_id, user_id)
);

alter table public.todos add column list_id uuid references public.lists (id) on delete set null;

create index lists_owner_id_idx on public.lists (owner_id);
create index lists_group_id_idx on public.lists (group_id);
create index list_members_user_id_idx on public.list_members (user_id);
create index todos_list_id_idx on public.todos (list_id);

alter table public.lists enable row level security;
alter table public.list_members enable row level security;

-- Helper: is the current user allowed to see/use a given list? Covers all
-- three cases: personal-list owner, personal-list invitee, group sub-list
-- (via ordinary group membership).
create function public.is_list_member(target_list_id uuid)
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
        or exists (
          select 1 from public.list_members lm
          where lm.list_id = l.id and lm.user_id = auth.uid()
        )
      )
  );
$$;

-- Helper for profiles_select below: do the caller and target user share a
-- personal list (owner or invited member of the same one)? Needed so a
-- friend invited to a personal list becomes visible by name, the same way
-- group-mates already are.
create function public.shares_list_with(target_user_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1
    from public.lists l
    where l.owner_id is not null
      and (
        l.owner_id = auth.uid()
        or exists (select 1 from public.list_members lm where lm.list_id = l.id and lm.user_id = auth.uid())
      )
      and (
        l.owner_id = target_user_id
        or exists (select 1 from public.list_members lm2 where lm2.list_id = l.id and lm2.user_id = target_user_id)
      )
  );
$$;

create policy "lists_select" on public.lists
  for select using (public.is_list_member(id));

create policy "lists_insert" on public.lists
  for insert with check (
    (owner_id = auth.uid() and group_id is null)
    or (group_id is not null and owner_id is null and public.is_group_member(group_id))
  );

create policy "lists_update" on public.lists
  for update using (public.is_list_member(id));

create policy "lists_delete" on public.lists
  for delete using (
    owner_id = auth.uid()
    or (group_id is not null and public.is_group_admin(group_id))
  );

create policy "list_members_select" on public.list_members
  for select using (public.is_list_member(list_id));

create policy "list_members_delete_self" on public.list_members
  for delete using (user_id = auth.uid());

create policy "list_members_delete_owner" on public.list_members
  for delete using (
    exists (select 1 from public.lists where id = list_id and owner_id = auth.uid())
  );

-- security definer: preview a personal list behind an invite token without
-- first satisfying lists_select (mirrors get_group_preview). Group sub-lists
-- are excluded — they're not meant to be joined directly, only via the group.
create function public.get_list_preview(token uuid)
returns table(id uuid, name text, member_count bigint)
language sql security definer set search_path = public
stable
as $$
  select l.id, l.name, count(lm.user_id) + 1
  from public.lists l
  left join public.list_members lm on lm.list_id = l.id
  where l.invite_token = token and l.owner_id is not null
  group by l.id, l.name;
$$;

create function public.join_list_by_token(token uuid)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  target_list_id uuid;
begin
  select id into target_list_id from public.lists where invite_token = token and owner_id is not null;

  if target_list_id is null then
    raise exception 'invalid_invite_token';
  end if;

  insert into public.list_members (list_id, user_id)
  values (target_list_id, auth.uid())
  on conflict (list_id, user_id) do nothing;

  return target_list_id;
end;
$$;

-- Extend todo visibility/write policies to also cover list membership, so a
-- friend invited to a shared personal list (who isn't its owner_id) can see
-- and edit todos filed in it, the same way group members already can for
-- group todos.
drop policy "todos_select" on public.todos;
create policy "todos_select" on public.todos
  for select using (
    owner_id = auth.uid()
    or (group_id is not null and public.is_group_member(group_id))
    or (list_id is not null and public.is_list_member(list_id))
  );

drop policy "todos_insert" on public.todos;
create policy "todos_insert" on public.todos
  for insert with check (
    owner_id = auth.uid()
    and (group_id is null or public.is_group_member(group_id))
    and (list_id is null or public.is_list_member(list_id))
  );

drop policy "todos_update" on public.todos;
create policy "todos_update" on public.todos
  for update using (
    owner_id = auth.uid()
    or (group_id is not null and public.is_group_member(group_id))
    or (list_id is not null and public.is_list_member(list_id))
  );

drop policy "todos_delete" on public.todos;
create policy "todos_delete" on public.todos
  for delete using (
    owner_id = auth.uid()
    or (group_id is not null and public.is_group_member(group_id))
    or (list_id is not null and public.is_list_member(list_id))
  );

drop policy "subtasks_all" on public.subtasks;
create policy "subtasks_all" on public.subtasks
  for all using (
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

drop policy "todo_tags_all" on public.todo_tags;
create policy "todo_tags_all" on public.todo_tags
  for all using (
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

-- Let people who share a personal list see each other's profile (display
-- name/avatar), same as group-mates already can.
drop policy "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (
    id = auth.uid()
    or exists (
      select 1 from public.group_members gm1
      join public.group_members gm2 on gm1.group_id = gm2.group_id
      where gm1.user_id = auth.uid() and gm2.user_id = public.profiles.id
    )
    or public.shares_list_with(public.profiles.id)
  );

-- ---- profile color (FR-3) -------------------------------------------------
alter table public.profiles add column color text not null default '#6366f1';
