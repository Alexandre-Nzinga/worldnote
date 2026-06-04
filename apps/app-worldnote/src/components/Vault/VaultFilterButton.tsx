import {
  CARD_VISUAL_CONFIG,
  CardTypePill,
  type WorldNoteCardType,
} from "@worldnote/canvas";
import { AnimatedPopover, Button, MaterialSymbol } from "@worldnote/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { modalFieldLabelClassName } from "../Onboarding/fieldClassNames.js";

const cardTypes: WorldNoteCardType[] = [
  "character",
  "location",
  "item",
  "vehicle",
  "flora",
  "fauna",
  "building",
  "structure",
  "species",
  "planet",
  "organization",
  "polity",
  "event",
  "family",
  "group",
  "star",
  "moon",
  "asteroid",
  "satellite",
  "law",
  "religion",
  "language",
  "culture",
  "spell",
  "disease",
  "disaster",
  "combat_style",
];

const activeTypePillButtonClassName =
  "rounded-full ring-2 ring-wn-mono-50 ring-offset-2 ring-offset-wn-mono-900";

type VaultFilterButtonProps = {
  selectedTypes: Set<string>;
  onToggle: (type: string) => void;
  onClear: () => void;
};

export function VaultFilterButton({
  selectedTypes,
  onToggle,
  onClear,
}: VaultFilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hasActiveFilters = selectedTypes.size > 0;

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || !rootRef.current?.contains(target)) {
        return;
      }
      close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [close, isOpen]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <div className="flex items-center gap-2 rounded-full border border-wn-mono-600 bg-wn-mono-50 py-1 pl-4 pr-1">
        <span className="select-none text-sm font-medium text-wn-mono-700">
          filter
        </span>
        <button
          type="button"
          onClick={toggleOpen}
          aria-label="Filter by card type"
          aria-expanded={isOpen}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wn-mono-950 text-wn-mono-50 transition-colors hover:bg-wn-mono-800"
        >
          <MaterialSymbol name="filter_list" className="text-base" />
          {hasActiveFilters ? (
            <span
              className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-wn-azure-400"
              aria-hidden
            />
          ) : null}
        </button>
      </div>

      <div className="absolute right-0 top-full z-20 mt-2 w-[min(100vw-3rem,24rem)]">
        <AnimatedPopover isOpen={isOpen}>
          <div className="rounded-2xl border border-wn-mono-700 bg-wn-mono-900 p-4 shadow-lg">
            <span className={modalFieldLabelClassName}>Filter by type</span>
            <div className="mt-3 flex flex-wrap gap-2.5 px-0.5 py-1">
              {cardTypes.map((type) => {
                const config = CARD_VISUAL_CONFIG[type];
                const isActive = selectedTypes.has(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onToggle(type)}
                    className={
                      isActive ? activeTypePillButtonClassName : "rounded-full"
                    }
                    aria-pressed={isActive}
                  >
                    <CardTypePill
                      className={`${config.badgeClassName} ${
                        isActive ? "" : "opacity-85 hover:opacity-100"
                      }`}
                      textClassName={config.badgeTextColor}
                    >
                      {config.label}
                    </CardTypePill>
                  </button>
                );
              })}
            </div>
            {hasActiveFilters ? (
              <div className="mt-3 border-t border-wn-mono-800 pt-3">
                <Button variant="link" size="sm" onPress={onClear}>
                  Clear filters
                </Button>
              </div>
            ) : null}
          </div>
        </AnimatedPopover>
      </div>
    </div>
  );
}
