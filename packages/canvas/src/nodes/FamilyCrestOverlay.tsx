/** Heraldic crest / banner shown on family cards (upper-right of visual view). */
export function FamilyCrestOverlay({ crestUrl }: { crestUrl?: string }) {
  if (!crestUrl?.trim()) {
    return null;
  }

  return (
    <img
      src={crestUrl}
      alt=""
      aria-hidden
      className="pointer-events-none absolute right-4 top-4 z-20 h-[76px] w-[64px] object-contain drop-shadow-md"
    />
  );
}
