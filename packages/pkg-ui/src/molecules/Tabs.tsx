import { Tab, Tabs as HeroUITabs } from "@heroui/react";
import clsx from "clsx";
import type { Key, ReactNode } from "react";

export type TabItem = {
  id: string;
  label: ReactNode;
  /** When omitted, only the tab strip is rendered (header-only mode). */
  content?: ReactNode;
  disabled?: boolean;
};

export type TabsVariant = "underline" | "segmented";

export type TabsProps = {
  items: TabItem[];
  selectedKey: string;
  onSelectionChange: (key: string) => void;
  variant?: TabsVariant;
  /** Accessible name for the tab list. */
  "aria-label"?: string;
  className?: string;
};

const underlineTabListClassName = "gap-0 rounded-none border-b border-wn-mono-800 bg-transparent p-0";

const underlineTabClassName =
  "h-auto flex-1 rounded-none border-b-2 border-transparent bg-transparent px-3 py-2.5 text-sm font-semibold text-wn-mono-500 shadow-none data-[selected=true]:border-wn-mono-50 data-[selected=true]:text-wn-mono-50";

const segmentedTabListClassName =
  "inline-flex w-fit gap-1 rounded-full border border-wn-border bg-wn-surface-sunken p-1";

const segmentedTabClassName =
  "h-auto min-h-0 rounded-full bg-transparent px-4 py-1.5 text-sm font-medium text-wn-text-muted shadow-none data-[selected=true]:bg-wn-surface-raised data-[selected=true]:text-wn-text data-[selected=true]:shadow-sm";

const segmentedCursorClassName = "rounded-full bg-wn-surface-raised shadow-sm";

/** HeroUI tabs for underline nav (inspector) or segmented toggles (theme/sort). */
export function Tabs({
  items,
  selectedKey,
  onSelectionChange,
  variant = "underline",
  "aria-label": ariaLabel,
  className,
}: TabsProps) {
  const hasPanels = items.some((item) => item.content != null);
  const isSegmented = variant === "segmented";

  return (
    <HeroUITabs
      aria-label={ariaLabel}
      selectedKey={selectedKey}
      onSelectionChange={(key: Key) => onSelectionChange(String(key))}
      variant={isSegmented ? "light" : "underlined"}
      radius={isSegmented ? "full" : "none"}
      classNames={{
        base: clsx("w-full", isSegmented && "w-auto", className),
        tabList: isSegmented ? segmentedTabListClassName : underlineTabListClassName,
        tab: isSegmented ? segmentedTabClassName : underlineTabClassName,
        cursor: isSegmented ? segmentedCursorClassName : undefined,
        panel: hasPanels ? "pt-4" : "hidden",
      }}
    >
      {items.map((item) => (
        <Tab key={item.id} title={item.label} isDisabled={item.disabled}>
          {item.content ?? null}
        </Tab>
      ))}
    </HeroUITabs>
  );
}
