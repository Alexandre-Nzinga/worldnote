import { Skeleton } from "../ui/Skeleton.js";
import { surfacePanelClassName } from "../shell/pageShellStyles.js";

const cardGridClassName =
  "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

function VaultCardSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-2">
      <Skeleton className="aspect-[3/4] w-full rounded-wn-card" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

const CARD_SKELETON_KEYS = ["a", "b", "c", "d", "e"] as const;

function VaultWorldSectionSkeleton({ cardCount = 5 }: { cardCount?: number }) {
  return (
    <section className={surfacePanelClassName}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className={cardGridClassName}>
        {CARD_SKELETON_KEYS.slice(0, cardCount).map((key) => (
          <VaultCardSkeleton key={key} />
        ))}
      </div>
    </section>
  );
}

/** Placeholder grid while vault cards and worlds load. */
export function VaultLoadingSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading vault"
      className="flex flex-col gap-6"
    >
      <VaultWorldSectionSkeleton cardCount={5} />
      <VaultWorldSectionSkeleton cardCount={4} />
    </div>
  );
}

/** Minimal shell when settings are not yet available. */
export function VaultPageSkeleton() {
  return (
    <div className="flex h-screen flex-col bg-wn-bg px-[46px] py-5">
      <div className="mb-8 flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-7 w-24" />
      </div>
      <Skeleton className="mb-2 h-8 w-48" />
      <Skeleton className="mb-6 h-4 w-72" />
      <VaultLoadingSkeleton />
    </div>
  );
}
