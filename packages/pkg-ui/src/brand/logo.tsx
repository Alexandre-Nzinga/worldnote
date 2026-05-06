export function WorldNoteLogo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[var(--radius-worldnote-card)] border-4 border-zinc-800 bg-zinc-900 px-3 py-1 font-semibold text-zinc-100 ${className}`}
    >
      WN
    </span>
  );
}
