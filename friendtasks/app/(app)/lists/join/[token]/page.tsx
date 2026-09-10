import { getListPreview } from "@/lib/data/lists";
import { joinList } from "@/lib/actions/lists";
import { Button } from "@/components/ui/button";

export default async function JoinListPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const preview = await getListPreview(token);

  if (!preview) {
    return (
      <div className="max-w-sm space-y-3">
        <h1 className="text-xl font-semibold">Einladung ungültig</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Dieser Einladungslink ist nicht mehr gültig.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm space-y-4">
      <h1 className="text-xl font-semibold">Einladung zur Liste „{preview.name}&quot;</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {preview.member_count} {preview.member_count === 1 ? "Person hat" : "Personen haben"} bereits Zugriff.
      </p>
      <form action={joinList.bind(null, token)}>
        <Button type="submit">Beitreten</Button>
      </form>
    </div>
  );
}
