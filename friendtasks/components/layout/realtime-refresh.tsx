"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Live-updates every todo view (FR-15): subscribes to Postgres changes on
// "todos" and re-fetches the current route's Server Components whenever a
// row changes. No manual filter is needed — Supabase Realtime applies the
// same RLS policies to postgres_changes as to a normal select, so this only
// ever fires for todos the signed-in user could see anyway (their own, plus
// their groups' and shared lists'). Renders nothing; mounted once in the
// app shell so every page benefits without per-page wiring.
export function RealtimeRefresh() {
  const router = useRouter();
  // Coalesce bursts of changes (e.g. a batch of inserts) into one refresh
  // instead of one per row.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("todos-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "todos" }, () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => router.refresh(), 300);
      })
      .subscribe();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
