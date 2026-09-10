-- FriendTasks initial schema
-- Run this once in the Supabase SQL Editor (or via `supabase db push`).

-- =========================================================================
-- Tables
-- =========================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  theme text not null default 'light' check (theme in ('light', 'dark')),
  created_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table public.todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  due_date date,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'open' check (status in ('open', 'done')),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  group_id uuid references public.groups (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subtasks (
  id uuid primary key default gen_random_uuid(),
  todo_id uuid not null references public.todos (id) on delete cascade,
  title text not null,
  is_done boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  color text not null default '#71717a',
  created_at timestamptz not null default now(),
  unique (owner_id, name)
);

create table public.todo_tags (
  todo_id uuid not null references public.todos (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (todo_id, tag_id)
);

-- Foundation for group task assignment (FR-14). Unused by the Phase 1 UI.
create table public.todo_assignees (
  todo_id uuid not null references public.todos (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  primary key (todo_id, user_id)
);

-- =========================================================================
-- Indexes (NFR-2)
-- =========================================================================

create index todos_owner_id_idx on public.todos (owner_id);
create index todos_group_id_idx on public.todos (group_id);
create index todos_due_date_idx on public.todos (due_date);
create index subtasks_todo_id_idx on public.subtasks (todo_id);
create index group_members_user_id_idx on public.group_members (user_id);
create index tags_owner_id_idx on public.tags (owner_id);

-- =========================================================================
-- updated_at trigger for todos
-- =========================================================================

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger todos_set_updated_at
  before update on public.todos
  for each row
  execute function public.set_updated_at();

-- =========================================================================
-- New-user provisioning: create a profile row when a Supabase Auth user
-- signs up, so the app never has to special-case a missing profile.
-- =========================================================================

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Automatically make a group's creator its first admin member.
create function public.handle_new_group()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.group_members (group_id, user_id, role)
  values (new.id, new.created_by, 'admin');
  return new;
end;
$$;

create trigger on_group_created
  after insert on public.groups
  for each row
  execute function public.handle_new_group();

-- =========================================================================
-- Row Level Security (NFR-6)
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.todos enable row level security;
alter table public.subtasks enable row level security;
alter table public.tags enable row level security;
alter table public.todo_tags enable row level security;
alter table public.todo_assignees enable row level security;

-- Helper: is the current user a member of a given group?
create function public.is_group_member(target_group_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.group_members
    where group_id = target_group_id and user_id = auth.uid()
  );
$$;

create function public.is_group_admin(target_group_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.group_members
    where group_id = target_group_id and user_id = auth.uid() and role = 'admin'
  );
$$;

-- ---- profiles ------------------------------------------------------------
-- Own profile, plus profiles of people who share a group with the caller
-- (needed once the Phase 2 group UI ships; harmless while no groups exist).
create policy "profiles_select" on public.profiles
  for select using (
    id = auth.uid()
    or exists (
      select 1 from public.group_members gm1
      join public.group_members gm2 on gm1.group_id = gm2.group_id
      where gm1.user_id = auth.uid() and gm2.user_id = public.profiles.id
    )
  );

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- ---- groups ---------------------------------------------------------------
create policy "groups_select_member" on public.groups
  for select using (public.is_group_member(id));

create policy "groups_insert_self" on public.groups
  for insert with check (created_by = auth.uid());

create policy "groups_update_admin" on public.groups
  for update using (public.is_group_admin(id));

create policy "groups_delete_admin" on public.groups
  for delete using (public.is_group_admin(id));

-- ---- group_members ---------------------------------------------------------
create policy "group_members_select" on public.group_members
  for select using (public.is_group_member(group_id));

create policy "group_members_insert_admin" on public.group_members
  for insert with check (public.is_group_admin(group_id));

create policy "group_members_delete_admin" on public.group_members
  for delete using (public.is_group_admin(group_id));

-- ---- todos ------------------------------------------------------------
create policy "todos_select" on public.todos
  for select using (
    owner_id = auth.uid()
    or (group_id is not null and public.is_group_member(group_id))
  );

create policy "todos_insert" on public.todos
  for insert with check (
    owner_id = auth.uid()
    and (group_id is null or public.is_group_member(group_id))
  );

create policy "todos_update" on public.todos
  for update using (
    owner_id = auth.uid()
    or (group_id is not null and public.is_group_member(group_id))
  );

create policy "todos_delete" on public.todos
  for delete using (
    owner_id = auth.uid()
    or (group_id is not null and public.is_group_member(group_id))
  );

-- ---- subtasks ---------------------------------------------------------
create policy "subtasks_all" on public.subtasks
  for all using (
    exists (
      select 1 from public.todos
      where todos.id = subtasks.todo_id
        and (
          todos.owner_id = auth.uid()
          or (todos.group_id is not null and public.is_group_member(todos.group_id))
        )
    )
  );

-- ---- tags ---------------------------------------------------------
create policy "tags_all_own" on public.tags
  for all using (owner_id = auth.uid());

-- ---- todo_tags ---------------------------------------------------------
create policy "todo_tags_all" on public.todo_tags
  for all using (
    exists (
      select 1 from public.todos
      where todos.id = todo_tags.todo_id
        and (
          todos.owner_id = auth.uid()
          or (todos.group_id is not null and public.is_group_member(todos.group_id))
        )
    )
  );

-- ---- todo_assignees ---------------------------------------------------------
create policy "todo_assignees_all" on public.todo_assignees
  for all using (
    exists (
      select 1 from public.todos
      where todos.id = todo_assignees.todo_id
        and todos.group_id is not null
        and public.is_group_member(todos.group_id)
    )
  );
