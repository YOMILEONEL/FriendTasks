import { getUserGroups } from "@/lib/data/groups";
import { createGroup } from "@/lib/actions/groups";
import { getDictionary } from "@/lib/i18n/server";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { GroupList } from "@/components/groups/group-list";

export default async function GroupsPage() {
  const [groups, t] = await Promise.all([getUserGroups(), getDictionary()]);

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-xl font-semibold">{t["nav.groups"]}</h1>

      <GroupList groups={groups} />

      <div className="space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t["groups.newGroup"]}</h2>
        <form action={createGroup} className="flex flex-wrap items-end gap-2">
          <div className="min-w-[160px] flex-1">
            <Label htmlFor="name">{t["common.name"]}</Label>
            <Input id="name" name="name" required placeholder={t["groups.namePlaceholder"]} />
          </div>
          <Button type="submit" className="shrink-0">
            {t["common.create"]}
          </Button>
        </form>
      </div>
    </div>
  );
}
