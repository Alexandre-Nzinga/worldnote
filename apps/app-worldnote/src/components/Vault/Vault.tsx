import { Input } from "@heroui/react";
import {
  Button,
  MaterialSymbol,
  getBodyTextStyle,
  getHeadingProps,
} from "@worldnote/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { LibraryCard } from "../../services/library/listAllCards.js";
import { listAllCards } from "../../services/library/listAllCards.js";
import { searchAllCards } from "../../services/library/searchAllCards.js";
import { useSettings } from "../../hooks/useSettings.js";
import {
  listWorlds,
  type WorldSummary,
} from "../../services/worlds/listWorlds.js";
import {
  pageBackdropClassName,
  pageShellClassName,
  panelFieldInputClassNames,
  segmentButtonClassName,
  segmentTrackClassName,
  surfacePanelClassName,
  surfacePanelStackClassName,
} from "../shell/pageShellStyles.js";
import { RichEmptyState } from "../ui/RichEmptyState.js";
import { toast } from "../../services/notifications/toast.js";
import { VaultCardChip } from "./VaultCardChip.js";
import { VaultFilterButton } from "./VaultFilterButton.js";
import { VaultLoadingSkeleton, VaultPageSkeleton } from "./VaultLoadingSkeleton.js";
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
  onCreateWorld?: () => void;
  onTrySampleWorld?: () => void;
  onAddCharacter?: () => void;
};

const cardGridClassName =
  "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: "az", label: "A–Z" },
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
];

export function Vault({
  onBack,
  worldnoteRoot,
  currentWorldPath,
  onCreateWorld,
  onTrySampleWorld,
  onAddCharacter,
}: VaultProps) {
  const settings = useSettings((state) => state.settings);

  const [items, setItems] = useState<LibraryCard[]>([]);
  const [worlds, setWorlds] = useState<WorldSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LibraryCard[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
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
    try {
      const [cards, worldSummaries] = await Promise.all([
        listAllCards(worldnoteRoot),
        listWorlds(worldnoteRoot),
      ]);
      setItems(cards);
      setWorlds(worldSummaries);
    } catch (loadError) {
      toast.error(
        loadError instanceof Error ? loadError.message : String(loadError),
      );
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
    const trimmed = query.trim();
    if (!trimmed || !worldnoteRoot?.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const timer = window.setTimeout(() => {
      void searchAllCards(worldnoteRoot, trimmed)
        .then((cards) => {
          if (!cancelled) {
            setSearchResults(cards);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setSearchResults([]);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsSearching(false);
          }
        });
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, worldnoteRoot]);

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
    const hasTypeFilter = selectedTypes.size > 0;
    const hasWorldFilter = selectedWorldPath !== ALL_WORLDS_PATH;
    const source = query.trim() ? (searchResults ?? []) : items;

    const next = source.filter((card) => {
      if (hasWorldFilter && card.worldPath !== selectedWorldPath) {
        return false;
      }
      if (hasTypeFilter && !selectedTypes.has(card.cardType)) {
        return false;
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
  }, [items, query, searchResults, selectedTypes, selectedWorldPath, sortMode]);

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

  const showGlobalEmpty =
    !isLoading && items.length === 0 && !hasActiveFilters;

  const vaultEmptyActions = useMemo(() => {
    if (worldList.length === 0) {
      const actions = [];
      if (onCreateWorld) {
        actions.push({
          label: "Create world",
          icon: "add",
          variant: "white" as const,
          onPress: onCreateWorld,
        });
      }
      if (onTrySampleWorld) {
        actions.push({
          label: "Try sample world",
          icon: "auto_stories",
          variant: "secondary" as const,
          onPress: onTrySampleWorld,
        });
      }
      return actions;
    }
    if (onAddCharacter) {
      return [
        {
          label: "Add Character",
          icon: "person",
          variant: "white" as const,
          onPress: onAddCharacter,
        },
      ];
    }
    return [];
  }, [onAddCharacter, onCreateWorld, onTrySampleWorld, worldList.length]);

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
    return <VaultPageSkeleton />;
  }

  const showGroupedByWorld = selectedWorldPath === ALL_WORLDS_PATH;

  return (
    <div className={pageShellClassName}>
      <div aria-hidden className={pageBackdropClassName} />
      <header className="relative z-10 flex shrink-0 items-center justify-between px-[46px] py-5">
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
          <h2 {...getHeadingProps("h3", { tone: "inverse" })}>Vault</h2>
        </div>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 overflow-hidden px-[46px] pb-8 pt-2">
        <div className="scrollbar-wn mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col overflow-y-auto scroll-pb-8">
          <div className={`${surfacePanelStackClassName} pb-6`}>
            <div className="flex flex-col gap-1">
              <h1 {...getHeadingProps("h2", { tone: "inverse" })}>All cards</h1>
              <p style={getBodyTextStyle("small")}>
                Browse and search every card across your worlds.
              </p>
            </div>

            <section className={`${surfacePanelClassName} flex flex-col gap-4`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className={segmentTrackClassName}>
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={sortMode === option.id}
                      className={segmentButtonClassName(sortMode === option.id)}
                      onClick={() => setSortMode(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <VaultFilterButton
                  selectedTypes={selectedTypes}
                  onToggle={toggleType}
                  onClear={clearTypeFilters}
                />
              </div>

              <Input
                id="vault-search"
                aria-label="Search cards"
                placeholder="Search by card name…"
                value={query}
                onValueChange={setQuery}
                classNames={panelFieldInputClassNames}
              />

              <WorldFilterPills
                worlds={worldList}
                selected={selectedWorldPath}
                onSelect={setSelectedWorldPath}
              />
            </section>

            <p style={getBodyTextStyle("xs")}>
              {isLoading
                ? "Loading…"
                : isSearching
                  ? "Searching…"
                  : `${filtered.length} card${filtered.length === 1 ? "" : "s"}`}
            </p>

            {isLoading ? (
              <VaultLoadingSkeleton />
            ) : showGlobalEmpty ? (
              <section className={surfacePanelClassName}>
                <RichEmptyState
                  title={
                    worldList.length === 0
                      ? "No worlds yet"
                      : !showGroupedByWorld && selectedWorld
                        ? `No cards in ${selectedWorld.name}`
                        : "No cards yet"
                  }
                  description={
                    worldList.length === 0
                      ? "Try the sample world to start building your library."
                      : "Add your first card on the canvas — characters, locations, and lore all show up here."
                  }
                  actions={vaultEmptyActions}
                />
              </section>
            ) : showGroupedByWorld ? (
              <div className={surfacePanelStackClassName}>
                {grouped.map((group) => (
                  <section key={group.worldPath} className={surfacePanelClassName}>
                    <div className="mb-4 flex items-baseline justify-between gap-3">
                      <h2 {...getHeadingProps("h5", { tone: "inverse" })}>
                        {group.worldName}
                      </h2>
                      <span style={getBodyTextStyle("xs")}>
                        {group.cards.length} card
                        {group.cards.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    {group.cards.length === 0 ? (
                      hasActiveFilters ? (
                        <p
                          className="py-6 text-center text-wn-mono-400"
                          style={getBodyTextStyle("small")}
                        >
                          No cards match your filters.
                        </p>
                      ) : (
                        <RichEmptyState
                          compact
                          title="No cards yet"
                          description="Open this world on the canvas to add cards."
                          actions={
                            onAddCharacter && group.worldPath === currentWorldPath
                              ? [
                                  {
                                    label: "Add Character",
                                    icon: "person",
                                    variant: "white" as const,
                                    onPress: onAddCharacter,
                                  },
                                ]
                              : []
                          }
                        />
                      )
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
            ) : filtered.length === 0 ? (
              <section className={surfacePanelClassName}>
                <RichEmptyState
                  compact
                  title="No cards found"
                  description={
                    hasActiveFilters
                      ? "Try a different search or clear your filters."
                      : "No cards match the current view."
                  }
                  actions={
                    hasActiveFilters
                      ? [
                          {
                            label: "Clear filters",
                            icon: "filter_alt_off",
                            variant: "secondary" as const,
                            onPress: () => {
                              setQuery("");
                              clearTypeFilters();
                            },
                          },
                        ]
                      : vaultEmptyActions
                  }
                />
              </section>
            ) : (
              <section className={surfacePanelClassName}>
                <div className={cardGridClassName}>
                  {filtered.map((card) => (
                    <VaultCardChip
                      key={`${card.worldPath}:${card.cardId}`}
                      card={card}
                      draggable={isDragEnabled}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
