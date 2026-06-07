import clsx from "clsx";

export type WorldNoteLogoVariant = "icon" | "wordmark";
export type WorldNoteLogoTone = "white" | "black";
export type WorldNoteLogoFormat = "png" | "svg";

const iconPath =
  "M1.45343 27.8516H0V51.3438H28.5838C31.2484 51.3438 32.2174 54.9766 29.795 56.1875L24.2236 58.8516C16.7143 62.4844 9.20499 64.4219 1.45343 64.4219H0V87.914H27.8572C30.5218 87.914 31.4907 91.5469 29.0683 92.7578L23.2547 95.4219C16.2298 98.8125 8.72052 100.508 1.45343 100.508H0V124H27.8572L31.0062 120.125C44.5714 104.383 60.3168 96.1484 76.7888 96.1484H78V72.6562H50.1428C47.4782 72.6562 46.5093 69.0234 48.9317 67.8125L54.7454 65.1484C61.7702 61.7578 69.2796 60.0625 76.5466 60.0625H77.7578V36.5703H49.4162C46.7516 36.5703 45.7826 32.9375 48.205 31.7266L53.7764 29.0625C61.2857 25.4297 68.7951 23.4922 76.5466 23.4922H77.7578V0H49.9007L46.7515 3.87501C33.6708 19.6172 17.6833 27.8516 1.45343 27.8516Z";

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

/** Portrait icon mark: keep caller height, drop square width utilities. */
function iconMarkClassName(className: string): string {
  const withoutWidth = className
    .replace(/\bw-\[[^\]]+\]/g, "")
    .replace(/\bw-\S+/g, "")
    .trim();

  return clsx("block w-auto shrink-0", withoutWidth);
}

function WorldNoteIconMark({
  className,
  tone,
  alt,
}: {
  className?: string;
  tone: WorldNoteLogoTone;
  alt?: string;
}) {
  const decorative = !alt || alt.trim().length === 0;

  return (
    <svg
      viewBox="0 0 78 124"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      className={iconMarkClassName(className ?? "")}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : alt}
      role={decorative ? undefined : "img"}
    >
      <path d={iconPath} fill={tone === "white" ? "white" : "black"} />
    </svg>
  );
}

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
  if (variant === "icon" && format === "svg") {
    return <WorldNoteIconMark className={className} tone={tone} alt={alt} />;
  }

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
