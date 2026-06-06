import { Skeleton } from "../ui/Skeleton.js";

const shellClassName = [
  "mx-auto flex w-full max-w-[360px] flex-col overflow-hidden",
  "rounded-wn-card border border-black/10 dark:border-white/10",
  "bg-linear-to-b from-black/[0.04] to-black/[0.01] dark:from-white/[0.07] dark:to-white/[0.02]",
  "shadow-[0_24px_48px_-24px_rgba(0,0,0,0.35)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_24px_48px_-24px_rgba(0,0,0,0.7)]",
  "backdrop-blur-2xl",
].join(" ");

/** Placeholder matching {@link WorldCard} layout while worlds load. */
export function WorldCardSkeleton() {
  return (
    <div
      aria-hidden
      className={shellClassName}
      style={{ borderRadius: "var(--radius-wn-card)" }}
    >
      <div className="p-2.5">
        <Skeleton className="h-[160px] rounded-2xl" />
      </div>
      <div className="flex items-center justify-between gap-3 px-4 pb-4 pt-1">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-3 w-14 shrink-0" />
      </div>
    </div>
  );
}

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f"] as const;

type WorldCardSkeletonGridProps = {
  count?: number;
};

export function WorldCardSkeletonGrid({ count = 6 }: WorldCardSkeletonGridProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading worlds"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {SKELETON_KEYS.slice(0, count).map((key) => (
        <WorldCardSkeleton key={key} />
      ))}
    </div>
  );
}
