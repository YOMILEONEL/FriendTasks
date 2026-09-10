import { getGroupPreview } from "@/lib/data/groups";
import { joinGroup } from "@/lib/actions/groups";
import { Button } from "@/components/ui/button";

export default async function JoinGroupPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const preview = await getGroupPreview(token);

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
      <h1 className="text-xl font-semibold">Einladung zu „{preview.name}&quot;</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {preview.member_count} {preview.member_count === 1 ? "Mitglied" : "Mitglieder"} sind bereits
        dabei.
      </p>
      <form action={joinGroup.bind(null, token)}>
        <Button type="submit">Beitreten</Button>
      </form>
    </div>
  );
}
