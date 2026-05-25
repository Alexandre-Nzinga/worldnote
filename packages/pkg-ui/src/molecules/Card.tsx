import clsx from "clsx";
import type { ReactNode } from "react";

export type CardProps = {
  /** Header title */
  title?: string;
  /** Optional supporting line in the header */
  subtitle?: string;
  /** Body content below the header divider */
  children?: ReactNode;
  className?: string;
};

/** Card with an optional bordered header section separated from the body. */
export function Card({ title, subtitle, children, className }: CardProps) {
  const hasHeader = Boolean(title);
  const hasBody = children != null && children !== false;

  return (
    <article
      className={clsx(
        "overflow-hidden rounded-wn-card border border-wn-mono-200 bg-wn-mono-50 text-wn-mono-950",
        className,
      )}
    >
      {hasHeader ? (
        <header
          className={clsx(
            "px-4 py-3",
            hasBody && "border-b border-wn-mono-200",
          )}
        >
          <h3 className="text-base font-semibold leading-snug text-wn-mono-950">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-1 text-sm leading-snug text-wn-mono-500">
              {subtitle}
            </p>
          ) : null}
        </header>
      ) : null}

      {hasBody ? (
        <div className="px-4 py-3 text-sm leading-relaxed text-wn-mono-900">
          {children}
        </div>
      ) : null}
    </article>
  );
}
