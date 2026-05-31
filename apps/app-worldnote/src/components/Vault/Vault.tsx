import { Input } from "@heroui/react";
import {
  Button,
  MaterialSymbol,
  WorldNoteLogo,
  getBodyTextStyle,
  getHeadingStyle,
  headingClass,
} from "@worldnote/ui";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { LibraryCard } from "../../services/library/listAllCards.js";
import { listAllCards } from "../../services/library/listAllCards.js";
import { useSettings } from "../../hooks/useSettings.js";
import {
  listWorlds,
  type WorldSummary,
} from "../../services/worlds/listWorlds.js";
import { darkFieldInputClassNames } from "../Onboarding/fieldClassNames.js";
import { VaultCardChip } from "./VaultCardChip.js";
import { VaultFilterButton } from "./VaultFilterButton.js";
import {
  ALL_WORLDS_PATH,
  WorldFilterPills,
  type WorldFilterOption,
} from "./WorldFilterPills.js";

type SortMode = "az" | "newest" | "oldest";

type VaultProps = {
  onBack: () => void;
  worldnoteRoot: string;
  currentWorldPath?: string;
};

const cardGridClassName =
  "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

function VaultWorldEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-wn-mono-800 bg-wn-mono-950/20 text-sm text-wn-mono-500">
      {message}
    </div>
  );
}

export function Vault({ onBack, worldnoteRoot, currentWorldPath }: VaultProps) {
  const settings = useSettings((state) => state.settings);

  const [items, setItems] = useState<LibraryCard[]>([]);
  const [worlds, setWorlds] = useState<WorldSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedWorldPath, setSelectedWorldPath] = useState(ALL_WORLDS_PATH);
  const [sortMode, setSortMode] = useState<SortMode>("az");

  const isDragEnabled = Boolean(currentWorldPath?.trim());

  const refresh = useCallback(async () => {
    if (!worldnoteRoot?.trim()) {
      setItems([]);
      setWorlds([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [cards, worldSummaries] = await Promise.all([
        listAllCards(worldnoteRoot),
        listWorlds(worldnoteRoot),
      ]);
      setItems(cards);
      setWorlds(worldSummaries);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : String(loadError));
      setItems([]);
      setWorlds([]);
    } finally {
      setIsLoading(false);
    }
  }, [worldnoteRoot]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onBack();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onBack]);

  const worldList = useMemo((): WorldFilterOption[] => {
    return [...worlds]
      .sort((a, b) => {
        const aHasCards = a.cardCount > 0;
        const bHasCards = b.cardCount > 0;
        if (aHasCards !== bHasCards) {
          return aHasCards ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      })
      .map((world) => ({ path: world.path, name: world.name }));
  }, [worlds]);

  const hasActiveFilters =
    query.trim().length > 0 || selectedTypes.size > 0;

  const selectedWorld = useMemo(
    () => worldList.find((world) => world.path === selectedWorldPath),
    [selectedWorldPath, worldList],
  );

  useEffect(() => {
    if (
      selectedWorldPath !== ALL_WORLDS_PATH &&
      !worldList.some((world) => world.path === selectedWorldPath)
    ) {
      setSelectedWorldPath(ALL_WORLDS_PATH);
    }
  }, [selectedWorldPath, worldList]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hasTypeFilter = selectedTypes.size > 0;
    const hasWorldFilter = selectedWorldPath !== ALL_WORLDS_PATH;

    const next = items.filter((card) => {
      if (hasWorldFilter && card.worldPath !== selectedWorldPath) {
        return false;
      }
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
  }, [items, query, selectedTypes, selectedWorldPath, sortMode]);

  const grouped = useMemo(() => {
    const cardsByPath = new Map<string, LibraryCard[]>();
    for (const card of filtered) {
      const existing = cardsByPath.get(card.worldPath);
      if (existing) {
        existing.push(card);
      } else {
        cardsByPath.set(card.worldPath, [card]);
      }
    }
    return worldList.map((world) => ({
      worldPath: world.path,
      worldName: world.name,
      cards: cardsByPath.get(world.path) ?? [],
    }));
  }, [filtered, worldList]);

  const emptyResultsMessage = useMemo(() => {
    if (
      selectedWorldPath !== ALL_WORLDS_PATH &&
      selectedWorld &&
      !hasActiveFilters
    ) {
      return `No cards in ${selectedWorld.name} yet.`;
    }
    return "No cards found.";
  }, [hasActiveFilters, selectedWorld, selectedWorldPath]);

  const emptyWorldSectionMessage = hasActiveFilters
    ? "No cards match your filters."
    : "No cards yet.";

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

  const clearTypeFilters = () => {
    setSelectedTypes(new Set());
  };

  if (!settings) {
    return (
      <div className="flex h-screen items-center justify-center bg-wn-mono-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <WorldNoteLogo
            variant="icon"
            tone="white"
            className="h-12 w-12 opacity-60"
            alt="Loading"
          />
        </motion.div>
      </div>
    );
  }

  const showGroupedByWorld = selectedWorldPath === ALL_WORLDS_PATH;

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-wn-mono-950 text-wn-mono-100">
      <header className="relative flex shrink-0 items-center justify-between px-[46px] pt-7">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            onPress={onBack}
            aria-label="Back"
            className="min-w-0 border-0 bg-transparent px-2 text-wn-mono-400 shadow-none hover:bg-transparent hover:text-wn-mono-50 data-[hover=true]:bg-transparent data-[hover=true]:text-wn-mono-50"
          >
            <MaterialSymbol name="arrow_back" className="text-lg" />
          </Button>
          <span
            className="text-wn-mono-50"
            style={{
              ...getBodyTextStyle("small"),
              fontSize: "24px",
              fontWeight: "var(--font-weight-wn-semibold)",
            }}
          >
            Vault
          </span>
        </div>
      </header>

      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-[46px] pb-8 pt-10">
        <div className="scrollbar-wn mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="flex flex-col gap-6 pb-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4 overflow-visible pr-1">
                <h1
                  className={`shrink-0 text-wn-mono-50 ${headingClass.h2}`}
                  style={{
                    ...getHeadingStyle("h2"),
                    color: "var(--color-wn-mono-50)",
                  }}
                >
                  All cards
                </h1>
                <div className="flex shrink-0 items-center gap-2">
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
                  <VaultFilterButton
                    selectedTypes={selectedTypes}
                    onToggle={toggleType}
                    onClear={clearTypeFilters}
                  />
                </div>
              </div>

              <Input
                id="vault-search"
                aria-label="Search cards"
                placeholder="Search by card name…"
                value={query}
                onValueChange={setQuery}
                classNames={darkFieldInputClassNames}
              />

              <WorldFilterPills
                worlds={worldList}
                selected={selectedWorldPath}
                onSelect={setSelectedWorldPath}
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-wn-mono-400">
                {isLoading
                  ? "Loading…"
                  : `${filtered.length} card${filtered.length === 1 ? "" : "s"}`}
              </span>
            </div>

            {error ? (
              <p className="text-sm text-wn-red-400" role="alert">
                {error}
              </p>
            ) : null}

            {isLoading ? (
              <div className="flex h-40 items-center justify-center rounded-2xl border border-wn-mono-800 bg-wn-mono-950/20 text-wn-mono-500">
                Loading cards…
              </div>
            ) : showGroupedByWorld ? (
              worldList.length === 0 ? (
                <VaultWorldEmpty message="No worlds yet." />
              ) : (
                <div className="flex flex-col gap-6">
                  {grouped.map((group) => (
                    <section key={group.worldPath} className="flex flex-col gap-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <h2 className="text-sm font-semibold text-wn-mono-50">
                          {group.worldName}
                        </h2>
                        <span className="text-xs text-wn-mono-500">
                          {group.cards.length} card
                          {group.cards.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      {group.cards.length === 0 ? (
                        <VaultWorldEmpty message={emptyWorldSectionMessage} />
                      ) : (
                        <div className={cardGridClassName}>
                          {group.cards.map((card) => (
                            <VaultCardChip
                              key={`${card.worldPath}:${card.cardId}`}
                              card={card}
                              draggable={isDragEnabled}
                            />
                          ))}
                        </div>
                      )}
                    </section>
                  ))}
                </div>
              )
            ) : filtered.length === 0 ? (
              <VaultWorldEmpty message={emptyResultsMessage} />
            ) : (
              <div className={cardGridClassName}>
                {filtered.map((card) => (
                  <VaultCardChip
                    key={`${card.worldPath}:${card.cardId}`}
                    card={card}
                    draggable={isDragEnabled}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
