import Link from "next/link";
import { getProfile } from "@/lib/data/dal";
import { getUserTags } from "@/lib/data/todos";
import { getDictionary } from "@/lib/i18n/server";
import { ProfileForm } from "@/components/settings/profile-form";
import { TagManager } from "@/components/settings/tag-manager";
import { DeleteAccount } from "@/components/settings/delete-account";

export default async function SettingsPage() {
  const [profile, tags, t] = await Promise.all([getProfile(), getUserTags(), getDictionary()]);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">{t["nav.settings"]}</h1>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t["settings.profile"]}</h2>
        <ProfileForm displayName={profile.display_name} color={profile.color} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t["settings.tags"]}</h2>
        <TagManager tags={tags} />
      </section>

      <section className="space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <h2 className="text-sm font-medium text-red-600 dark:text-red-400">{t["shared.dangerZone"]}</h2>
        <DeleteAccount />
      </section>

      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        <Link href="/privacy" className="hover:text-zinc-600 dark:hover:text-zinc-300">
          {t["settings.privacyLink"]}
        </Link>
      </p>
    </div>
  );
}
