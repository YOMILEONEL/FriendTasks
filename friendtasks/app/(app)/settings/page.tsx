import { getProfile } from "@/lib/data/dal";
import { getUserTags } from "@/lib/data/todos";
import { ProfileForm } from "@/components/settings/profile-form";
import { TagManager } from "@/components/settings/tag-manager";
import { DeleteAccount } from "@/components/settings/delete-account";

export default async function SettingsPage() {
  const [profile, tags] = await Promise.all([getProfile(), getUserTags()]);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Einstellungen</h1>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Profil</h2>
        <ProfileForm displayName={profile.display_name} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Tags</h2>
        <TagManager tags={tags} />
      </section>

      <section className="space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <h2 className="text-sm font-medium text-red-600 dark:text-red-400">Gefahrenzone</h2>
        <DeleteAccount />
      </section>
    </div>
  );
}
