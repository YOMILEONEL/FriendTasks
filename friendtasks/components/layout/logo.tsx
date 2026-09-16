const SIZE_CLASSES = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-14 w-14 text-2xl",
} as const;

// PT monogram: a bold "P" in front, a lighter "T" behind and offset, so the
// two letters read as one combined mark rather than two stacked initials.
export function LogoMark({
  size = "sm",
  className = "",
}: {
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-indigo-600 font-bold text-white ${SIZE_CLASSES[size]} ${className}`}
    >
      <span aria-hidden className="absolute inset-0 flex items-center justify-center translate-x-[18%] translate-y-[6%] text-white/30">
        T
      </span>
      <span aria-hidden className="relative">
        P
      </span>
      <span className="sr-only">PlanyourTasks</span>
    </span>
  );
}
