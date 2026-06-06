import { useEffect, useState } from "react";
import type { CardSearchResult } from "../services/canvas/searchCanvasCards.js";
import { searchCardIndex } from "../services/cards/searchCardIndex.js";

type UseCardIndexSearchOptions = {
  vault: string | null | undefined;
  query: string;
  isActive: boolean;
  limit?: number;
};

export function useCardIndexSearch({
  vault,
  query,
  isActive,
  limit = 20,
}: UseCardIndexSearchOptions) {
  const [results, setResults] = useState<CardSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isActive || !vault?.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const timer = window.setTimeout(() => {
      void searchCardIndex(vault, query, limit)
        .then((hits) => {
          if (cancelled) {
            return;
          }
          setResults(
            hits.map((hit) => ({
              cardId: hit.id,
              matchKind: hit.matchKind,
              matchDetail: hit.matchDetail,
            })),
          );
        })
        .catch(() => {
          if (!cancelled) {
            setResults([]);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsSearching(false);
          }
        });
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isActive, limit, query, vault]);

  return { results, isSearching };
}
