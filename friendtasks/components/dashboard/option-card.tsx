import Link from "next/link";

export function OptionCard({
  href,
  title,
  description,
  count,
}: {
  href: string;
  title: string;
  description: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-50">{title}</h3>
        {typeof count === "number" && (
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400">
            {count}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </Link>
  );
}
