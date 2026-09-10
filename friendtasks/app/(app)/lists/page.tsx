import { getUserVisibleLists } from "@/lib/data/lists";
import { createPersonalList } from "@/lib/actions/lists";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ListOverview } from "@/components/lists/list-overview";

export default async function ListsPage() {
  const lists = await getUserVisibleLists();

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-xl font-semibold">Listen</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Persönliche Listen, die du mit einzelnen Freunden teilen kannst — unabhängig von Gruppen.
      </p>

      <ListOverview lists={lists} />

      <div className="space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Neue Liste</h2>
        <form action={createPersonalList} className="flex flex-wrap items-end gap-2">
          <div className="min-w-[160px] flex-1">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="z. B. Uni-Projekt mit Anna" />
          </div>
          <Button type="submit" className="shrink-0">
            Erstellen
          </Button>
        </form>
      </div>
    </div>
  );
}
