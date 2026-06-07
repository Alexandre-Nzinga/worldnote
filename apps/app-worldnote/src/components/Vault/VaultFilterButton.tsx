import { CardTypePill, type WorldNoteCardType } from "@worldnote/canvas";
import {
  AnimatedPopover,
  Button,
  getHeadingProps,
  MaterialSymbol,
} from "@worldnote/ui";
import { useSettings } from "../../hooks/useSettings.js";
import { resolveCardBadgeStyle } from "../../services/settings/cardTypeBadgeSettings.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { primaryAccentRingOnSurfaceClassName } from "../../services/settings/primaryAccentStyles.js";
import { surfacePanelClassName } from "../shell/pageShellStyles.js";

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

const activeTypePillButtonClassName = `rounded-full ${primaryAccentRingOnSurfaceClassName}`;

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
  const cardTypeBadgeColors = useSettings(
    (state) => state.settings?.cardTypeBadgeColors,
  );
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
      <button
        type="button"
        onClick={toggleOpen}
        aria-label="Filter by card type"
        aria-expanded={isOpen}
        className="relative flex h-10 items-center gap-2 rounded-full bg-wn-surface-raised px-4 text-sm font-medium text-wn-text transition-colors hover:bg-wn-mono-800"
      >
        <MaterialSymbol name="filter_list" className="text-base" />
        Filter
        {hasActiveFilters ? (
          <span
            className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-wn-azure-400"
            aria-hidden
          />
        ) : null}
      </button>

      <div className="absolute right-0 top-full z-20 mt-2 w-[min(100vw-3rem,24rem)]">
        <AnimatedPopover isOpen={isOpen}>
          <div className={`${surfacePanelClassName} shadow-lg`}>
            <h3 {...getHeadingProps("h6", { tone: "inverse" })}>
              Filter by type
            </h3>
            <div className="mt-3 flex flex-wrap gap-2.5 px-0.5 py-1">
              {cardTypes.map((type) => {
                const config = resolveCardBadgeStyle(type, cardTypeBadgeColors);
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
              <div className="mt-4 border-t border-wn-border pt-4">
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
