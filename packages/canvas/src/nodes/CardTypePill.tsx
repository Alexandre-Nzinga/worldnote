import type { ComponentProps, ReactNode } from "react";

type CardTypePillProps = ComponentProps<"span"> & {
  children: ReactNode;
  textClassName?: string;
};

/** Card-type badge pill (canvas-local; mirrors @worldnote/ui Pill for build isolation). */
export function CardTypePill({
  children,
  textClassName,
  className = "",
  ...props
}: CardTypePillProps) {
  const textClass = textClassName ?? "text-wn-mono-950";
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ${className} ${textClass}`}
      {...props}
    >
      {children}
    </span>
  );
}
