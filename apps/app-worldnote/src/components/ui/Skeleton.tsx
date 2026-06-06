type SkeletonProps = {
  className?: string;
};

/** Pulse placeholder block — use inside layout shells that mirror real content. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-lg bg-wn-mono-800/80 ${className}`}
    />
  );
}
