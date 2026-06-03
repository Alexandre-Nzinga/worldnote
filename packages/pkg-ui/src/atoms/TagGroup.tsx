import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

export type TagGroupProps = ComponentProps<"div"> & {
  children: ReactNode;
  /** Accessible label when tags are used as a filter group. */
  "aria-label"?: string;
};

/** Flex-wrap container for Tag clusters. */
export function TagGroup({
  children,
  className,
  role = "group",
  ...props
}: TagGroupProps) {
  return (
    <div
      role={role}
      className={clsx("flex flex-wrap items-center gap-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}
