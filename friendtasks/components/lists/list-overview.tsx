"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useT } from "@/components/i18n/locale-provider";
import type { List } from "@/lib/types/list";

export function ListOverview({ lists }: { lists: List[] }) {
  const [query, setQuery] = useState("");
  const t = useT();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lists;
    return lists.filter((list) => list.name.toLowerCase().includes(q));
  }, [lists, query]);

  return (
    <div className="space-y-3">
      {lists.length > 5 && (
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("lists.searchPlaceholder")} />
      )}
      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {lists.length === 0 ? t("lists.emptyNone") : t("lists.emptySearch")}
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((list) => (
            <li key={list.id}>
              <Link
                href={`/lists/${list.id}`}
                className="block rounded-lg border border-zinc-200 p-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                {list.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
