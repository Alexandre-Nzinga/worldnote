import clsx from "clsx";
import type { ReactNode } from "react";
import {
  getBodyTextStyle,
  getHeadingProps,
} from "../../../brand/typography/typography.js";

export type CardTone = "light" | "dark";

export type CardProps = {
  /** Header title */
  title?: string;
  /** Optional supporting line in the header */
  subtitle?: string;
  /** Monospace eyebrow above the title */
  eyebrow?: ReactNode;
  /** Media slot (image, video) above body */
  media?: ReactNode;
  /** Tag cluster below title */
  tags?: ReactNode;
  /** Footer actions (buttons, links) */
  actions?: ReactNode;
  /** Surface palette */
  tone?: CardTone;
  /** Body content below the header divider */
  children?: ReactNode;
  className?: string;
};

const toneClassNames: Record<CardTone, string> = {
  light: "border-wn-mono-200 bg-wn-mono-50 text-wn-mono-950",
  dark: "border-wn-mono-800 bg-wn-mono-900 text-wn-mono-50",
};

const headerDividerClassNames: Record<CardTone, string> = {
  light: "border-wn-mono-200",
  dark: "border-wn-mono-800",
};

const subtitleClassNames: Record<CardTone, string> = {
  light: "text-wn-mono-500",
  dark: "text-wn-mono-400",
};

const bodyClassNames: Record<CardTone, string> = {
  light: "text-wn-mono-900",
  dark: "text-wn-mono-200",
};

/** Card with optional eyebrow, media, tags, and actions (Alture-style content card). */
export function Card({
  title,
  subtitle,
  eyebrow,
  media,
  tags,
  actions,
  tone = "light",
  children,
  className,
}: CardProps) {
  const hasHeader = Boolean(title || eyebrow || subtitle || tags);
  const hasBody = children != null && children !== false;
  const hasMedia = media != null;
  const hasActions = actions != null && actions !== false;

  return (
    <article
      className={clsx(
        "overflow-hidden rounded-wn-card border",
        toneClassNames[tone],
        className,
      )}
    >
      {hasMedia ? <div className="w-full overflow-hidden">{media}</div> : null}

      {hasHeader ? (
        <header
          className={clsx(
            "flex flex-col gap-2 px-4 py-3",
            (hasBody || hasActions) &&
              `border-b ${headerDividerClassNames[tone]}`,
          )}
        >
          {eyebrow ? <div>{eyebrow}</div> : null}
          {title ? <h3 {...getHeadingProps("h4")}>{title}</h3> : null}
          {subtitle ? (
            <p
              className={clsx(
                "text-wn-small leading-snug",
                subtitleClassNames[tone],
              )}
              style={getBodyTextStyle("small")}
            >
              {subtitle}
            </p>
          ) : null}
          {tags ? <div>{tags}</div> : null}
        </header>
      ) : null}

      {hasBody ? (
        <div
          className={clsx(
            "px-4 py-3 text-wn-small leading-relaxed",
            bodyClassNames[tone],
          )}
          style={getBodyTextStyle("small")}
        >
          {children}
        </div>
      ) : null}

      {hasActions ? (
        <footer
          className={clsx(
            "flex flex-wrap items-center gap-2 px-4 py-3",
            hasBody && `border-t ${headerDividerClassNames[tone]}`,
          )}
        >
          {actions}
        </footer>
      ) : null}
    </article>
  );
}
