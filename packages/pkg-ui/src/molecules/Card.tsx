import clsx from "clsx";
import type { ReactNode } from "react";
import { WorldNoteLogo } from "../brand/logo.js";

export type CardProps = {
  title: string;
  subtitle?: string;
  /** Front face content */
  children?: ReactNode;
  className?: string;
  flipped?: boolean;
};

/**
 * Skeuomorphic card shell.
 */
export function Card({
  title,
  subtitle,
  children,
  className,
  flipped = false,
}: CardProps) {
  return (
    <div className={clsx("relative h-48 w-72 [perspective:1000px]", className)}>
      <div
        className={clsx(
          "absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d]",
          flipped && "[transform:rotateY(180deg)]",
        )}
      >
        <div className="absolute inset-0 flex flex-col gap-2 overflow-hidden rounded-[var(--radius-wn-card)] border-8 border-wn-mono-800 bg-gradient-to-br from-wn-mono-800 to-wn-mono-950 p-4 text-wn-mono-50 [backface-visibility:hidden]">
          <div className={headingMeta.title}>{title}</div>
          {subtitle ? (
            <div className="text-sm text-wn-mono-400">{subtitle}</div>
          ) : null}
          <div className="flex-1 text-sm text-wn-mono-300">{children}</div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center rounded-[var(--radius-wn-card)] border-8 border-wn-mono-700 bg-wn-mono-900 [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <WorldNoteLogo className="scale-125" />
        </div>
      </div>
    </div>
  );
}

const headingMeta = {
  title: "text-[length:var(--text-wn-h5)] font-semibold",
};
