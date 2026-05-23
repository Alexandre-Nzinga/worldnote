export type WorldNoteLogoVariant = "icon" | "wordmark";
export type WorldNoteLogoTone = "white" | "black";
export type WorldNoteLogoFormat = "png" | "svg";

const logoSources: Record<
  WorldNoteLogoVariant,
  Record<WorldNoteLogoTone, Record<WorldNoteLogoFormat, string>>
> = {
  icon: {
    white: {
      // Keep png key for compatibility, but source the official SVG asset.
      png: new URL("./assets/logo-icon-white.svg", import.meta.url).href,
      svg: new URL("./assets/logo-icon-white.svg", import.meta.url).href,
    },
    black: {
      // Keep png key for compatibility, but source the official SVG asset.
      png: new URL("./assets/logo-icon-black.svg", import.meta.url).href,
      svg: new URL("./assets/logo-icon-black.svg", import.meta.url).href,
    },
  },
  wordmark: {
    white: {
      // Keep png key for compatibility, but source the official SVG asset.
      png: new URL("./assets/logo-wordmark-white.svg", import.meta.url).href,
      svg: new URL("./assets/logo-wordmark-white.svg", import.meta.url).href,
    },
    black: {
      // Keep png key for compatibility, but source the official SVG asset.
      png: new URL("./assets/logo-wordmark-black.svg", import.meta.url).href,
      svg: new URL("./assets/logo-wordmark-black.svg", import.meta.url).href,
    },
  },
};

type WorldNoteLogoProps = {
  className?: string;
  variant?: WorldNoteLogoVariant;
  tone?: WorldNoteLogoTone;
  format?: WorldNoteLogoFormat;
  alt?: string;
};

export function getWorldNoteLogoSrc(
  variant: WorldNoteLogoVariant,
  tone: WorldNoteLogoTone,
  format: WorldNoteLogoFormat,
) {
  return logoSources[variant][tone][format];
}

export function WorldNoteLogo({
  className = "",
  variant = "icon",
  tone = "white",
  format = "svg",
  alt,
}: WorldNoteLogoProps) {
  return (
    <img
      src={getWorldNoteLogoSrc(variant, tone, format)}
      alt={alt ?? `WorldNote ${variant} (${tone})`}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}
