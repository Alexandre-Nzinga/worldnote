import { Input } from "@heroui/react";
import { CARD_TYPE_LABELS } from "@worldnote/shared";
import type { WorldCard } from "@worldnote/shared";
import { AnimatedModal, getHeadingProps, MaterialSymbol } from "@worldnote/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { darkFieldInputClassNames } from "../../Onboarding/fieldClassNames.js";
import { useCardIndexSearch } from "../../../hooks/useCardIndexSearch.js";
import type {
  CardSearchMatchKind,
  CardSearchResult,
} from "../../../services/canvas/searchCanvasCards.js";

type CanvasCommandPaletteProps = {
  isOpen: boolean;
  onClose: () => void;
  vaultPath: string | null | undefined;
  cardsById: Record<string, WorldCard>;
  onJumpToCard: (cardId: string, options?: { focusOnCanvas?: boolean }) => void;
};

function matchKindLabel(
  kind: CardSearchMatchKind,
  detail: string | undefined,
): string {
  if (kind === "tag" && detail) {
    return `Tag · ${detail}`;
  }
  if (kind === "lore") {
    return "Lore";
  }
  return "Name";
}

export function CanvasCommandPalette({
  isOpen,
  onClose,
  vaultPath,
  cardsById,
  onJumpToCard,
}: CanvasCommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [focusOnCanvas, setFocusOnCanvas] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollSelectedIntoView = useCallback(() => {
    const selected = listRef.current?.querySelector("[data-selected='true']");
    selected?.scrollIntoView({ block: "nearest" });
  }, []);

  const { results, isSearching } = useCardIndexSearch({
    vault: vaultPath,
    query,
    isActive: isOpen,
  });

  const jumpTo = useCallback(
    (result: CardSearchResult) => {
      onJumpToCard(result.cardId, { focusOnCanvas });
      onClose();
    },
    [focusOnCanvas, onClose, onJumpToCard],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setQuery("");
    setSelectedIndex(0);
    setFocusOnCanvas(true);
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (results.length === 0) {
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((index) => {
          const next = (index + 1) % results.length;
          requestAnimationFrame(scrollSelectedIntoView);
          return next;
        });
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((index) => {
          const next = (index + results.length - 1) % results.length;
          requestAnimationFrame(scrollSelectedIntoView);
          return next;
        });
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const result = results[selectedIndex];
        if (result) {
          jumpTo(result);
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, jumpTo, onClose, results, scrollSelectedIntoView, selectedIndex]);

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="canvas-command-palette-title"
      panelClassName="relative z-10 flex max-h-[min(85vh,28rem)] w-full max-w-xl flex-col gap-3 overflow-hidden rounded-2xl border border-wn-mono-800 bg-wn-mono-900 p-4 text-wn-mono-100 shadow-2xl"
    >
      <header className="flex flex-col gap-1">
        <h2
          id="canvas-command-palette-title"
          {...getHeadingProps("h6", { tone: "inverse", weight: "semibold" })}
        >
          Jump to card
        </h2>
        <p className="text-sm text-wn-mono-400">
          Search by name, tag, or lore body
        </p>
      </header>

      <Input
        ref={inputRef}
        aria-label="Search cards"
        placeholder="Name, tag, or lore…"
        value={query}
        onValueChange={(value) => {
          setQuery(value);
          setSelectedIndex(0);
        }}
        classNames={darkFieldInputClassNames}
        startContent={
          <MaterialSymbol
            name="search"
            className="text-[18px] text-wn-mono-500"
          />
        }
      />

      <label className="flex cursor-pointer items-center gap-2 px-1 text-sm text-wn-mono-300">
        <input
          type="checkbox"
          checked={focusOnCanvas}
          onChange={(event) => setFocusOnCanvas(event.target.checked)}
          className="size-4 rounded border-wn-mono-600 bg-wn-mono-950 text-wn-azure-500 focus:ring-wn-azure-500"
        />
        <span>Focus on canvas</span>
      </label>

      <div
        ref={listRef}
        className="scrollbar-wn min-h-0 flex-1 overflow-y-auto rounded-xl border border-wn-mono-800"
        aria-label="Search results"
      >
        {isSearching ? (
          <p className="px-3 py-6 text-center text-sm text-wn-mono-500">
            Searching…
          </p>
        ) : results.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-wn-mono-500">
            No cards found
          </p>
        ) : (
          results.map((result, index) => {
            const card = cardsById[result.cardId];
            const isSelected = index === selectedIndex;
            return (
              <button
                key={result.cardId}
                type="button"
                aria-current={isSelected ? "true" : undefined}
                data-selected={isSelected ? "true" : undefined}
                className={`flex w-full items-center gap-3 border-b border-wn-mono-800/80 px-3 py-2.5 text-left last:border-b-0 ${
                  isSelected
                    ? "bg-wn-mono-800 text-wn-mono-50"
                    : "text-wn-mono-200 hover:bg-wn-mono-800/50"
                }`}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => jumpTo(result)}
              >
                <span className="min-w-0 flex-1 truncate font-medium">
                  {card?.name ?? result.cardId}
                </span>
                <span className="shrink-0 text-xs text-wn-mono-500">
                  {card ? CARD_TYPE_LABELS[card.card_type] : "Card"}
                </span>
                <span className="shrink-0 text-[11px] text-wn-mono-500">
                  {matchKindLabel(result.matchKind, result.matchDetail)}
                </span>
              </button>
            );
          })
        )}
      </div>

      <p className="px-1 text-[11px] text-wn-mono-500">
        <kbd className="rounded bg-wn-mono-800 px-1.5 py-0.5 font-mono">↑↓</kbd>{" "}
        navigate ·{" "}
        <kbd className="rounded bg-wn-mono-800 px-1.5 py-0.5 font-mono">
          Enter
        </kbd>{" "}
        jump ·{" "}
        <kbd className="rounded bg-wn-mono-800 px-1.5 py-0.5 font-mono">
          Esc
        </kbd>{" "}
        close
      </p>
    </AnimatedModal>
  );
}
