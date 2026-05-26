import { Input } from "@heroui/react";
import { AnimatedModal, Button, Pill } from "@worldnote/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { LibraryCard } from "../../services/library/listAllCards.js";
import { listAllCards } from "../../services/library/listAllCards.js";
import {
  darkFieldInputClassNames,
  modalFieldLabelClassName,
} from "../Onboarding/fieldClassNames.js";
import { VaultCardChip } from "./VaultCardChip.js";
import { CARD_TYPE_LABELS } from "@worldnote/shared";

type SortMode = "az" | "newest" | "oldest";

type VaultModalProps = {
  isOpen: boolean;
  onClose: () => void;
  worldnoteRoot: string;
  currentWorldPath?: string;
};

const cardTypes = [
  "character",
  "location",
  "item",
  "vehicle",
  "flora",
  "fauna",
  "building",
  "structure",
  "species",
] as const;

export function VaultModal({
  isOpen,
  onClose,
  worldnoteRoot,
  currentWorldPath,
}: VaultModalProps) {
  const [items, setItems] = useState<LibraryCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [sortMode, setSortMode] = useState<SortMode>("az");

  const isDragEnabled = Boolean(currentWorldPath?.trim());

  const refresh = useCallback(async () => {
    if (!worldnoteRoot?.trim()) {
      setItems([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await listAllCards(worldnoteRoot);
      setItems(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : String(loadError));
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [worldnoteRoot]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    void refresh();
  }, [isOpen, refresh]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hasTypeFilter = selectedTypes.size > 0;

    const next = items.filter((card) => {
      if (hasTypeFilter && !selectedTypes.has(card.cardType)) {
        return false;
      }
      if (q) {
        return card.name.toLowerCase().includes(q);
      }
      return true;
    });

    const sortFn =
      sortMode === "az"
        ? (a: LibraryCard, b: LibraryCard) => a.name.localeCompare(b.name)
        : sortMode === "newest"
          ? (a: LibraryCard, b: LibraryCard) => b.createdAt - a.createdAt
          : (a: LibraryCard, b: LibraryCard) => a.createdAt - b.createdAt;

    next.sort(sortFn);
    return next;
  }, [items, query, selectedTypes, sortMode]);

  const grouped = useMemo(() => {
    const byWorld = new Map<
      string,
      { worldName: string; cards: LibraryCard[] }
    >();
    for (const card of filtered) {
      const existing = byWorld.get(card.worldPath);
      if (existing) {
        existing.cards.push(card);
      } else {
        byWorld.set(card.worldPath, { worldName: card.worldName, cards: [card] });
      }
    }
    return Array.from(byWorld.entries())
      .map(([worldPath, value]) => ({ worldPath, ...value }))
      .sort((a, b) => a.worldName.localeCompare(b.worldName));
  }, [filtered]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="vault-title"
      panelClassName="relative z-10 flex w-full max-w-4xl flex-col gap-6 rounded-2xl border border-wn-mono-800 bg-wn-mono-900 p-6 text-wn-mono-100 shadow-2xl"
    >
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="vault-title" className="text-xl font-semibold text-wn-mono-50">
            Vault
          </h2>
          <p className="text-sm text-wn-mono-400">
            Browse all cards across your worlds. {isDragEnabled ? "Drag cards onto the canvas to copy them." : "Open a world to enable drag & drop."}
          </p>
        </div>
        <Button variant="secondary" size="sm" onPress={onClose}>
          Close
        </Button>
      </header>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className={modalFieldLabelClassName} htmlFor="vault-search">
            Search
          </label>
          <Input
            id="vault-search"
            aria-label="Search cards"
            placeholder="Search by card name…"
            value={query}
            onValueChange={setQuery}
            classNames={darkFieldInputClassNames}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className={modalFieldLabelClassName}>Filter by type</span>
          <div className="flex flex-wrap gap-2">
            {cardTypes.map((type) => {
              const isActive = selectedTypes.has(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className="rounded-full"
                >
                  <Pill
                    size="sm"
                    tone={isActive ? "mono-dark" : "outline"}
                  >
                    {CARD_TYPE_LABELS[type]}
                  </Pill>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-wn-mono-400">
            {isLoading ? "Loading…" : `${filtered.length} card${filtered.length === 1 ? "" : "s"}`}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant={sortMode === "az" ? "white" : "secondary"}
              size="sm"
              onPress={() => setSortMode("az")}
            >
              A–Z
            </Button>
            <Button
              variant={sortMode === "newest" ? "white" : "secondary"}
              size="sm"
              onPress={() => setSortMode("newest")}
            >
              Newest
            </Button>
            <Button
              variant={sortMode === "oldest" ? "white" : "secondary"}
              size="sm"
              onPress={() => setSortMode("oldest")}
            >
              Oldest
            </Button>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-wn-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="scrollbar-wn max-h-[60vh] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-wn-mono-800 bg-wn-mono-950/20 text-wn-mono-500">
              Loading cards…
            </div>
          ) : grouped.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-wn-mono-800 bg-wn-mono-950/20 text-wn-mono-500">
              No cards found.
            </div>
          ) : (
            <div className="flex flex-col gap-6 pb-2">
              {grouped.map((group) => (
                <section key={group.worldPath} className="flex flex-col gap-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-sm font-semibold text-wn-mono-50">
                      {group.worldName}
                    </h3>
                    <span className="text-xs text-wn-mono-500">
                      {group.cards.length} card{group.cards.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {group.cards.map((card) => (
                      <VaultCardChip
                        key={`${card.worldPath}:${card.cardId}`}
                        card={card}
                        draggable={isDragEnabled}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </AnimatedModal>
  );
}

