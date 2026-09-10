-- Adds shareable invite links for groups and the RLS/RPC plumbing needed
-- for a not-yet-a-member user to preview and accept an invite.

alter table public.groups add column invite_token uuid not null default gen_random_uuid();

-- A member could already be removed by an admin (group_members_delete_admin),
-- but had no way to remove themselves (leave a group).
create policy "group_members_delete_self" on public.group_members
  for delete using (user_id = auth.uid());

-- security definer: lets a signed-in, not-yet-a-member user see the group's
-- name/size behind an invite token without satisfying groups_select_member.
create function public.get_group_preview(token uuid)
returns table(id uuid, name text, member_count bigint)
language sql security definer set search_path = public
stable
as $$
  select g.id, g.name, count(gm.user_id)
  from public.groups g
  left join public.group_members gm on gm.group_id = g.id
  where g.invite_token = token
  group by g.id, g.name;
$$;

-- security definer: adds the calling user as a member for a valid token.
create function public.join_group_by_token(token uuid)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  target_group_id uuid;
begin
  select id into target_group_id from public.groups where invite_token = token;

  if target_group_id is null then
    raise exception 'invalid_invite_token';
  end if;

  insert into public.group_members (group_id, user_id, role)
  values (target_group_id, auth.uid(), 'member')
  on conflict (group_id, user_id) do nothing;

  return target_group_id;
end;
$$;
