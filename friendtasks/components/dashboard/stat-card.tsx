import Link from "next/link";
import type { ComponentType } from "react";

export function StatCard({
  href,
  label,
  value,
  icon: Icon,
}: {
  href: string;
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
        <Icon className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />
      </div>
      <div className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{value}</div>
    </Link>
  );
}
