import { MaterialSymbol } from "@worldnote/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  worldCoverPaletteKey,
  type WorldCoverPaletteKey,
} from "../Home/worldCover.js";

export const ALL_WORLDS_PATH = "__all__";

export type WorldFilterOption = {
  path: string;
  name: string;
};

type WorldFilterPillsProps = {
  worlds: WorldFilterOption[];
  selected: string;
  onSelect: (path: string) => void;
};

const pillBaseClassName =
  "inline-flex shrink-0 items-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all";

const palettePillClassNames: Record<WorldCoverPaletteKey, string> = {
  mono: "bg-wn-mono-200 text-wn-mono-950",
  indigo: "bg-wn-indigo-200 text-wn-mono-950",
  azure: "bg-wn-azure-200 text-wn-mono-950",
  rose: "bg-wn-rose-200 text-wn-mono-950",
  amber: "bg-wn-amber-200 text-wn-mono-950",
  lime: "bg-wn-lime-200 text-wn-mono-950",
};

function pillClassName(worldName: string | null, isActive: boolean): string {
  if (worldName === null) {
    return isActive
      ? `${pillBaseClassName} bg-wn-mono-300 text-wn-mono-950`
      : `${pillBaseClassName} border border-wn-mono-700 bg-wn-mono-950 text-wn-mono-400 hover:border-wn-mono-600 hover:text-wn-mono-200`;
  }

  const palette = worldCoverPaletteKey(worldName);
  const colors = palettePillClassNames[palette];
  return isActive
    ? `${pillBaseClassName} ${colors}`
    : `${pillBaseClassName} ${colors} opacity-85 hover:opacity-100`;
}

const activePillButtonClassName =
  "rounded-full ring-2 ring-wn-mono-50 ring-offset-2 ring-offset-wn-mono-950";

function PillButton({
  label,
  worldName,
  isActive,
  onClick,
  buttonRef,
}: {
  label: string;
  worldName: string | null;
  isActive: boolean;
  onClick: () => void;
  buttonRef?: (node: HTMLButtonElement | null) => void;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      className={isActive ? `shrink-0 ${activePillButtonClassName}` : "shrink-0"}
      aria-pressed={isActive}
    >
      <span className={pillClassName(worldName, isActive)}>{label}</span>
    </button>
  );
}

const arrowButtonClassName = [
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
  "border border-wn-mono-700 bg-wn-mono-950 text-wn-mono-300",
  "transition-colors hover:border-wn-mono-600 hover:text-wn-mono-50",
  "disabled:cursor-not-allowed disabled:opacity-40",
].join(" ");

export function WorldFilterPills({
  worlds,
  selected,
  onSelect,
}: WorldFilterPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const { scrollLeft, clientWidth, scrollWidth } = el;
    setCanScrollLeft(scrollLeft > 1);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    updateScrollState();
    const observer = new ResizeObserver(() => {
      updateScrollState();
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [updateScrollState]);

  useEffect(() => {
    const activeEl = pillRefs.current.get(selected);
    activeEl?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selected]);

  const scrollByPage = (direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    el.scrollBy({
      left: direction * el.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex items-center gap-3 border-b border-wn-mono-800 py-1 pb-5">
      <button
        type="button"
        className={arrowButtonClassName}
        disabled={!canScrollLeft}
        onClick={() => scrollByPage(-1)}
        aria-label="Scroll worlds left"
      >
        <MaterialSymbol name="chevron_left" className="text-xl" />
      </button>

      <div
        ref={scrollRef}
        className="scrollbar-wn flex min-w-0 flex-1 items-center gap-3 overflow-x-auto px-1 py-2"
        onScroll={updateScrollState}
      >
        <PillButton
          label="All"
          worldName={null}
          isActive={selected === ALL_WORLDS_PATH}
          onClick={() => onSelect(ALL_WORLDS_PATH)}
          buttonRef={(node) => {
            if (node) {
              pillRefs.current.set(ALL_WORLDS_PATH, node);
            } else {
              pillRefs.current.delete(ALL_WORLDS_PATH);
            }
          }}
        />
        {worlds.map((world) => (
          <PillButton
            key={world.path}
            label={world.name}
            worldName={world.name}
            isActive={selected === world.path}
            onClick={() => onSelect(world.path)}
            buttonRef={(node) => {
              if (node) {
                pillRefs.current.set(world.path, node);
              } else {
                pillRefs.current.delete(world.path);
              }
            }}
          />
        ))}
      </div>

      <button
        type="button"
        className={arrowButtonClassName}
        disabled={!canScrollRight}
        onClick={() => scrollByPage(1)}
        aria-label="Scroll worlds right"
      >
        <MaterialSymbol name="chevron_right" className="text-xl" />
      </button>
    </div>
  );
}
