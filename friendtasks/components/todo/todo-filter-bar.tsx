"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
          placeholder="Suchen…"
          className="min-w-0 flex-1"
        />
        <Button type="submit" variant="secondary" className="shrink-0">
          Suchen
        </Button>
      </form>
      <div className="flex flex-wrap gap-2">
        <Select
          defaultValue={searchParams.get("status") ?? "all"}
          onChange={(e) => updateParam("status", e.target.value)}
          className="w-auto"
        >
          <option value="all">Alle Status</option>
          <option value="open">Offen</option>
          <option value="done">Erledigt</option>
        </Select>
        <Select
          defaultValue={searchParams.get("priority") ?? "all"}
          onChange={(e) => updateParam("priority", e.target.value)}
          className="w-auto"
        >
          <option value="all">Alle Prioritäten</option>
          <option value="low">Niedrig</option>
          <option value="medium">Mittel</option>
          <option value="high">Hoch</option>
        </Select>
        {showSort && (
          <Select
            defaultValue={searchParams.get("sort") ?? "created_at"}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="w-auto"
          >
            <option value="created_at">Neueste zuerst</option>
            <option value="due_date">Fälligkeit</option>
            <option value="priority">Priorität</option>
          </Select>
        )}
        {tags.length > 0 && (
          <Select
            defaultValue={searchParams.get("tagId") ?? "all"}
            onChange={(e) => updateParam("tagId", e.target.value)}
            className="w-auto"
          >
            <option value="all">Alle Tags</option>
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
