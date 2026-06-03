import { Accordion, AccordionItem } from "@heroui/react";
import clsx from "clsx";
import type { ReactNode } from "react";
import { MaterialSymbol } from "../atoms/MaterialSymbol/MaterialSymbol.js";
import { NumberBadge } from "../atoms/NumberBadge/NumberBadge.js";

export type AccordionItemData = {
  id: string;
  title: ReactNode;
  content: ReactNode;
  /** Optional index shown in a NumberBadge (1, 2, 3…). */
  index?: number;
  disabled?: boolean;
};

export type AccordionMoleculeProps = {
  items: AccordionItemData[];
  /** Allow multiple sections open at once. */
  selectionMode?: "single" | "multiple";
  defaultExpandedKeys?: string[];
  className?: string;
};

function AccordionIndicator({ isOpen }: { isOpen?: boolean }) {
  return (
    <MaterialSymbol
      name={isOpen ? "remove" : "add"}
      className="text-xl text-wn-mono-400"
    />
  );
}

/** FAQ-style accordion with +/- indicator and optional numbered badges. */
export function AccordionGroup({
  items,
  selectionMode = "multiple",
  defaultExpandedKeys,
  className,
}: AccordionMoleculeProps) {
  return (
    <Accordion
      selectionMode={selectionMode}
      defaultExpandedKeys={defaultExpandedKeys}
      className={clsx("flex flex-col gap-2 px-0", className)}
      itemClasses={{
        base: "rounded-2xl border border-wn-mono-800 bg-wn-mono-900 px-0 shadow-none",
        trigger:
          "flex items-center gap-3 px-4 py-4 hover:bg-wn-mono-900/80 data-[hover=true]:bg-wn-mono-900/80",
        title: "text-sm font-semibold text-wn-mono-50",
        subtitle: "text-wn-mono-500",
        indicator: "text-wn-mono-400",
        content: "px-4 pb-4 pt-0 text-sm font-medium leading-relaxed text-wn-mono-400",
      }}
    >
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          aria-label={typeof item.title === "string" ? item.title : item.id}
          title={
            <span className="flex items-center gap-3">
              {item.index != null ? (
                <NumberBadge value={item.index} size="sm" />
              ) : null}
              <span>{item.title}</span>
            </span>
          }
          indicator={({ isOpen }) => <AccordionIndicator isOpen={isOpen} />}
          isDisabled={item.disabled}
        >
          {item.content}
        </AccordionItem>
      ))}
    </Accordion>
  );
}
