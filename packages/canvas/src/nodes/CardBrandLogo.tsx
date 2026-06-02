type CardBrandLogoProps = {
  onClick?: () => void;
};

/** Small glassmorphic WorldNote mark; click toggles visual / node view when onClick is set. */
export function CardBrandLogo({ onClick }: CardBrandLogoProps) {
  const glassLogoSrc = new URL(
    "./assets/worldnote-glass-logo.svg",
    import.meta.url,
  ).href;

  const content = (
    <img
      src={glassLogoSrc}
      alt=""
      className="h-[18px] w-auto opacity-90"
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );

  const shellClassName =
    "z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-white/25 bg-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.35)] backdrop-blur-md transition-colors hover:border-white/40 hover:bg-white/15";

  if (onClick) {
    return (
      <button
        type="button"
        className={`absolute left-3 top-3 ${shellClassName} cursor-pointer`}
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        aria-label="Toggle card node view"
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={`pointer-events-none absolute left-3 top-3 ${shellClassName}`}
      aria-hidden
    >
      {content}
    </div>
  );
}
