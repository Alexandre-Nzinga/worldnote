import {
  hasEmptyTypeProperties,
  listEmptyTypePropertyFields,
  listEmptyWizardGeneratableFields,
  listWizardGeneratableFields,
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
    "expand" | "fill-gaps" | "generate-properties" | "suggestion" | null
  >(null);
  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(
    null,
  );
  const [activeFieldKeys, setActiveFieldKeys] = useState<string[]>([]);

  const hostRef = useRef(DEFAULT_OLLAMA_HOST);
  const modelRef = useRef("");
  const guidelinesRef = useRef("");

  const suggestions = useMemo(() => {
    if (!selectedCard) return [];
    return analyzeWizardSuggestions({
      selectedCard,
    });
  }, [selectedCard]);

  const isGeneratingField = useCallback(
    (fieldKey: string) =>
      status === "generating" && activeFieldKeys.includes(fieldKey),
    [activeFieldKeys, status],
  );

  const isGeneratingLore = isGeneratingField("lore");

  const canGenerateProperties = useMemo(
    () => (selectedCard ? hasEmptyTypeProperties(selectedCard) : false),
    [selectedCard],
  );

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

  const finishGeneration = useCallback(() => {
    setStatus("idle");
    setActiveAction(null);
    setActiveSuggestionId(null);
    setActiveFieldKeys([]);
  }, []);

  const runPatch = useCallback(
    async (
      targetCard: WorldCard,
      mode: "expand" | "fill-gaps",
      fieldKeys?: string[],
    ): Promise<WorldCard> => {
      const model = modelRef.current;
      if (!model) {
        throw new Error("No Ollama model configured. Set one in Settings.");
      }
      if (!healthy) {
        throw new Error("Ollama is not reachable. Check Settings.");
      }

      const fields =
        fieldKeys && fieldKeys.length > 0
          ? fieldKeys
          : mode === "fill-gaps"
            ? listEmptyWizardGeneratableFields(targetCard)
            : listWizardGeneratableFields(targetCard.card_type);

      if (fields.length === 0) {
        throw new Error("No fields to generate on this card.");
      }

      const contextMessage = buildPatchContextMessage(
        [targetCard],
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
      });
    },
    [cardsById, healthy, links, worldName],
  );

  const runExpand = useCallback(
    async (card: WorldCard): Promise<WorldCard> => {
      const fields = listWizardGeneratableFields(card.card_type);
      setActiveAction("expand");
      setActiveFieldKeys(fields);
      setStatus("generating");
      try {
        return await runPatch(card, "expand", fields);
      } catch (error) {
        finishGeneration();
        throw error;
      }
    },
    [finishGeneration, runPatch],
  );

  const runFillGaps = useCallback(
    async (card: WorldCard): Promise<WorldCard> => {
      const fields = listEmptyWizardGeneratableFields(card);
      setActiveAction("fill-gaps");
      setActiveFieldKeys(fields);
      setStatus("generating");
      try {
        return await runPatch(card, "fill-gaps", fields);
      } catch (error) {
        finishGeneration();
        throw error;
      }
    },
    [finishGeneration, runPatch],
  );

  const runGenerateProperties = useCallback(
    async (card: WorldCard): Promise<WorldCard> => {
      const fields = listEmptyTypePropertyFields(card);
      if (fields.length === 0) {
        throw new Error("No empty properties to generate on this card.");
      }
      setActiveAction("generate-properties");
      setActiveFieldKeys(fields);
      setStatus("generating");
      try {
        return await runPatch(card, "fill-gaps", fields);
      } catch (error) {
        finishGeneration();
        throw error;
      }
    },
    [finishGeneration, runPatch],
  );

  const runSuggestion = useCallback(
    async (suggestion: WizardSuggestion): Promise<WorldCard> => {
      if (!selectedCard) {
        throw new Error("No card selected.");
      }
      if (suggestion.targetCardId !== selectedCard.id) {
        throw new Error("Suggestion does not apply to the selected card.");
      }

      setActiveAction("suggestion");
      setActiveSuggestionId(suggestion.id);
      setActiveFieldKeys([suggestion.fieldKey]);
      setStatus("generating");
      try {
        return await runPatch(selectedCard, suggestion.action, [
          suggestion.fieldKey,
        ]);
      } catch (error) {
        finishGeneration();
        throw error;
      }
    },
    [finishGeneration, runPatch, selectedCard],
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
    isGeneratingField,
    canGenerateProperties,
    finishGeneration,
    runExpand,
    runFillGaps,
    runGenerateProperties,
    runSuggestion,
    handleError,
  };
}
