"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n/locale-provider";
import type { Tag } from "@/lib/types/todo";

export function TodoFilterBar({
  basePath,
  tags,
  showSort = false,
}: {
  basePath: string;
  tags: Tag[];
  showSort?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const t = useT();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${basePath}?${params.toString()}`);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParam("q", query);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <form onSubmit={handleSearchSubmit} className="flex min-w-[200px] flex-1 gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("filter.searchPlaceholder")}
          className="min-w-0 flex-1"
        />
        <Button type="submit" variant="secondary" className="shrink-0">
          {t("filter.search")}
        </Button>
      </form>
      <div className="flex flex-wrap gap-2">
        <Select
          defaultValue={searchParams.get("status") ?? "all"}
          onChange={(e) => updateParam("status", e.target.value)}
          className="w-auto"
        >
          <option value="all">{t("filter.allStatus")}</option>
          <option value="open">{t("filter.open")}</option>
          <option value="done">{t("filter.done")}</option>
        </Select>
        <Select
          defaultValue={searchParams.get("priority") ?? "all"}
          onChange={(e) => updateParam("priority", e.target.value)}
          className="w-auto"
        >
          <option value="all">{t("filter.allPriorities")}</option>
          <option value="low">{t("todoForm.priorityLow")}</option>
          <option value="medium">{t("todoForm.priorityMedium")}</option>
          <option value="high">{t("todoForm.priorityHigh")}</option>
        </Select>
        {showSort && (
          <Select
            defaultValue={searchParams.get("sort") ?? "created_at"}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="w-auto"
          >
            <option value="created_at">{t("filter.sortNewest")}</option>
            <option value="due_date">{t("filter.sortDueDate")}</option>
            <option value="priority">{t("filter.sortPriority")}</option>
          </Select>
        )}
        {tags.length > 0 && (
          <Select
            defaultValue={searchParams.get("tagId") ?? "all"}
            onChange={(e) => updateParam("tagId", e.target.value)}
            className="w-auto"
          >
            <option value="all">{t("filter.allTags")}</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </Select>
        )}
      </div>
    </div>
  );
}
