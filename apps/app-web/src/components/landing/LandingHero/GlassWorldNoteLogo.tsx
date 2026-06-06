const GLASS_LOGO_ICON_SRC = "/landing/worldnote-logo-icon.svg";

export function GlassWorldNoteLogo() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden
          className="absolute h-56 w-56 rounded-full bg-wn-rose-500/35 blur-3xl md:h-72 md:w-72"
        />
        <div
          aria-hidden
          className="absolute h-52 w-52 rounded-full bg-wn-azure-500/35 blur-3xl md:h-64 md:w-64"
        />
        <img
          src={GLASS_LOGO_ICON_SRC}
          alt="WorldNote"
          className="relative z-10 h-[140px] w-[88px] object-contain md:h-[180px] md:w-[113px]"
          decoding="async"
        />
      </div>
    </div>
  );
}
