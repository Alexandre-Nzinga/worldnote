import {
  isFieldEmpty,
  listEmptyGeneratableFields,
  listGeneratableFields,
  type Link,
  type WorldCard,
} from "@worldnote/shared";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "../../../services/notifications/toast.js";
import { getSettings } from "../../../services/settings/settings.js";
import {
  analyzeWizardSuggestions,
  buildPatchContextMessage,
  buildSystemPrompt,
  checkOllamaHealth,
  DEFAULT_OLLAMA_HOST,
  generateCardPatch,
  type WizardSuggestion,
} from "../../../services/wizard/index.js";

export type InspectorWizardStatus = "idle" | "connecting" | "generating";

type UseInspectorWizardArgs = {
  vaultPath: string;
  worldName: string;
  selectedCard: WorldCard | undefined;
  cardsById: Record<string, WorldCard>;
  links: Link[];
  enabled: boolean;
};

export function useInspectorWizard({
  vaultPath,
  worldName,
  selectedCard,
  cardsById,
  links,
  enabled,
}: UseInspectorWizardArgs) {
  const [status, setStatus] = useState<InspectorWizardStatus>("idle");
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [activeAction, setActiveAction] = useState<
    "expand" | "fill-gaps" | "suggestion" | null
  >(null);
  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(
    null,
  );

  const hostRef = useRef(DEFAULT_OLLAMA_HOST);
  const modelRef = useRef("");
  const guidelinesRef = useRef("");

  const suggestions = useMemo(() => {
    if (!selectedCard) return [];
    return analyzeWizardSuggestions({
      selectedCard,
      cardsById,
      links,
    });
  }, [selectedCard, cardsById, links]);

  const isGeneratingLore = useMemo(() => {
    if (status !== "generating" || !selectedCard) return false;

    if (activeAction === "suggestion") {
      const suggestion = suggestions.find((item) => item.id === activeSuggestionId);
      return (
        suggestion?.targetCardId === selectedCard.id &&
        suggestion.gapLabel === "lore"
      );
    }

    if (activeAction === "fill-gaps" || activeAction === "expand") {
      return isFieldEmpty(selectedCard, "lore");
    }

    return false;
  }, [
    activeAction,
    activeSuggestionId,
    selectedCard,
    status,
    suggestions,
  ]);

  useEffect(() => {
    if (!enabled || !vaultPath) return;
    let cancelled = false;
    void (async () => {
      setStatus("connecting");
      const settings = await getSettings();
      if (cancelled) return;
      hostRef.current = settings?.wizard?.host?.trim() || DEFAULT_OLLAMA_HOST;
      modelRef.current = settings?.wizard?.defaultModel?.trim() ?? "";
      guidelinesRef.current = settings?.wizard?.guidelines?.trim() ?? "";
      const ok = await checkOllamaHealth(hostRef.current);
      if (cancelled) return;
      setHealthy(ok);
      setStatus("idle");
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, vaultPath]);

  const runPatch = useCallback(
    async (
      targetCard: WorldCard,
      mode: "expand" | "fill-gaps",
      linkedContext?: { sourceCardName: string; socketLabel: string },
      contextCards?: WorldCard[],
    ): Promise<WorldCard> => {
      const model = modelRef.current;
      if (!model) {
        throw new Error("No Ollama model configured. Set one in Settings.");
      }
      if (!healthy) {
        throw new Error("Ollama is not reachable. Check Settings.");
      }

      const fields =
        mode === "fill-gaps"
          ? listEmptyGeneratableFields(targetCard)
          : listGeneratableFields(targetCard.card_type);

      if (fields.length === 0) {
        throw new Error("No fields to generate on this card.");
      }

      const cardsForContext = contextCards ?? [targetCard];
      const contextMessage = buildPatchContextMessage(
        cardsForContext,
        cardsById,
        links,
        worldName,
      );

      return generateCardPatch({
        host: hostRef.current,
        model,
        card: targetCard,
        mode,
        systemPrompt: buildSystemPrompt(guidelinesRef.current),
        contextMessage,
        fields,
        linkedContext,
      });
    },
    [cardsById, healthy, links, worldName],
  );

  const runExpand = useCallback(
    async (card: WorldCard): Promise<WorldCard> => {
      setActiveAction("expand");
      setStatus("generating");
      try {
        return await runPatch(card, "expand");
      } finally {
        setActiveAction(null);
        setStatus("idle");
      }
    },
    [runPatch],
  );

  const runFillGaps = useCallback(
    async (card: WorldCard): Promise<WorldCard> => {
      setActiveAction("fill-gaps");
      setStatus("generating");
      try {
        return await runPatch(card, "fill-gaps");
      } finally {
        setActiveAction(null);
        setStatus("idle");
      }
    },
    [runPatch],
  );

  const runSuggestion = useCallback(
    async (suggestion: WizardSuggestion): Promise<WorldCard> => {
      const target = cardsById[suggestion.targetCardId];
      const source = cardsById[suggestion.sourceCardId];
      if (!target) {
        throw new Error("Target card no longer exists.");
      }

      setActiveAction("suggestion");
      setActiveSuggestionId(suggestion.id);
      setStatus("generating");
      try {
        const linkedContext =
          source && suggestion.socketLabel
            ? {
                sourceCardName: source.name,
                socketLabel: suggestion.socketLabel,
              }
            : undefined;
        const contextCards =
          source && source.id !== target.id ? [source, target] : [target];
        return await runPatch(
          target,
          suggestion.action,
          linkedContext,
          contextCards,
        );
      } finally {
        setActiveSuggestionId(null);
        setActiveAction(null);
        setStatus("idle");
      }
    },
    [cardsById, runPatch],
  );

  const handleError = useCallback((err: unknown) => {
    toast.error(
      err instanceof Error ? err.message : "WorldWizard could not complete.",
    );
  }, []);

  return {
    status,
    healthy,
    activeAction,
    activeSuggestionId,
    suggestions,
    isGeneratingLore,
    runExpand,
    runFillGaps,
    runSuggestion,
    handleError,
  };
}
