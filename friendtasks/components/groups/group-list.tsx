"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useT } from "@/components/i18n/locale-provider";
import type { Group } from "@/lib/types/group";

export function GroupList({ groups }: { groups: Group[] }) {
  const [query, setQuery] = useState("");
  const t = useT();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((group) => group.name.toLowerCase().includes(q));
  }, [groups, query]);

  return (
    <div className="space-y-3">
      {groups.length > 5 && (
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("groups.searchPlaceholder")}
        />
      )}
      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {groups.length === 0 ? t("groups.emptyNone") : t("groups.emptySearch")}
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((group) => (
            <li key={group.id}>
              <Link
                href={`/groups/${group.id}`}
                className="block rounded-lg border border-zinc-200 p-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                {group.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
