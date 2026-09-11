import Link from "next/link";
import { getGroupPreview } from "@/lib/data/groups";
import { joinGroup } from "@/lib/actions/groups";
import { getDictionary } from "@/lib/i18n/server";
import { format } from "@/lib/i18n/format";
import { Button } from "@/components/ui/button";

export default async function JoinGroupPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [preview, t] = await Promise.all([getGroupPreview(token), getDictionary()]);

  if (!preview) {
    return (
      <div className="max-w-sm space-y-3">
        <h1 className="text-xl font-semibold">{t["shared.inviteInvalidTitle"]}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t["shared.inviteInvalidBody"]}</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm space-y-4">
      <h1 className="text-xl font-semibold">{format(t["groups.joinTitle"], { name: preview.name })}</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {preview.member_count === 1
          ? t["groups.memberCountOne"]
          : format(t["groups.memberCountMany"], { count: preview.member_count })}
      </p>

      {preview.my_status === "member" ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t["shared.alreadyMember"]}</p>
          <Link href={`/groups/${preview.id}`}>
            <Button type="button">{t["shared.goToGroup"]}</Button>
          </Link>
        </div>
      ) : preview.my_status === "pending" ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t["shared.requestSent"]}</p>
      ) : (
        <div className="space-y-2">
          {preview.my_status === "declined" && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{t["shared.requestDeclined"]}</p>
          )}
          <form action={joinGroup.bind(null, token)}>
            <Button type="submit">{t["common.requestJoin"]}</Button>
          </form>
        </div>
      )}
    </div>
  );
}
