import {
  listEmptyWizardGeneratableFields,
  listWizardGeneratableFields,
  type Link,
  type WorldCard,
} from "@worldnote/shared";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  getSettings,
  saveSettings,
  type AppSettings,
} from "../../../services/settings/settings.js";
import {
  buildCardCreationPrompt,
  buildPatchContextMessage,
  buildSystemPrompt,
  buildWorldContextMessage,
  checkOllamaHealth,
  DEFAULT_OLLAMA_HOST,
  detectCardGenerationFollowUp,
  detectCardGenerationIntent,
  fetchWorldCardIndex,
  generateCard,
  generateCardPatch,
  listOllamaModels,
  streamWizardChat,
  type CardIndexRow,
  type WizardActionPreset,
  type WizardChatMessage,
  type WizardContextScope,
} from "../../../services/wizard/index.js";
import type { StoredWizardMessage } from "../../../services/wizard/wizardSessionTypes.js";
import { useWizardSessions } from "./useWizardSessions.js";

export type WizardStatus = "idle" | "connecting" | "generating";

export type WizardMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  /** Shown with the typing indicator while a non-streaming operation runs. */
  loadingLabel?: string;
  /** A generated card awaiting spawn or apply. */
  generatedCard?: WorldCard;
  /** Whether the generated card should be spawned (new) or applied (patch). */
  generatedCardAction?: "spawn" | "apply";
  error?: boolean;
};

type UseWorldWizardArgs = {
  vaultPath: string;
  worldName: string;
  cardsById: Record<string, WorldCard>;
  links: Link[];
  isOpen: boolean;
  /** Seeds focus cards and restricts context to them when opening from a selection. */
  seedCardIds?: string[] | null;
  /** Places generated cards onto the canvas automatically. */
  onSpawnGeneratedCard?: (card: WorldCard) => void;
};

function makeId(): string {
  return crypto.randomUUID();
}

function toStoredMessages(messages: WizardMessage[]): StoredWizardMessage[] {
  return messages
    .filter((message) => !message.streaming)
    .map(({ streaming: _streaming, ...message }) => message);
}

export function useWorldWizard({
  vaultPath,
  worldName,
  cardsById,
  links,
  isOpen,
  seedCardIds = null,
  onSpawnGeneratedCard,
}: UseWorldWizardArgs) {
  const [droppedCardIds, setDroppedCardIds] = useState<string[]>([]);
  const [contextScope, setContextScope] = useState<WizardContextScope>("world");
  const [messages, setMessages] = useState<WizardMessage[]>([]);
  const [status, setStatus] = useState<WizardStatus>("idle");
  const [host, setHost] = useState(DEFAULT_OLLAMA_HOST);
  const [model, setModel] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [indexRows, setIndexRows] = useState<CardIndexRow[]>([]);

  const settingsRef = useRef<AppSettings | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const hydratedSessionIdRef = useRef<string | null>(null);
  const seedHandledRef = useRef<string | null>(null);

  const sessions = useWizardSessions({ vaultPath, isOpen });

  const droppedCards = useMemo(
    () =>
      droppedCardIds
        .map((id) => cardsById[id])
        .filter((card): card is WorldCard => Boolean(card)),
    [droppedCardIds, cardsById],
  );

  const cardCount = Object.keys(cardsById).length;
  const linkCount = links.length;

  const worldContextMessage = useMemo(
    () =>
      vaultPath
        ? buildWorldContextMessage({
            worldName,
            vaultPath,
            cardsById,
            links,
            indexRows,
            focusedCardIds: droppedCardIds,
            contextScope,
          })
        : "",
    [
      vaultPath,
      worldName,
      cardsById,
      links,
      indexRows,
      droppedCardIds,
      contextScope,
    ],
  );

  const refreshConnection = useCallback(async (nextHost: string) => {
    setStatus("connecting");
    const ok = await checkOllamaHealth(nextHost);
    setHealthy(ok);
    if (ok) {
      try {
        const found = await listOllamaModels(nextHost);
        setModels(found);
        setModel((current) => {
          if (current && found.includes(current)) return current;
          const preferred = settingsRef.current?.wizard?.defaultModel;
          if (preferred && found.includes(preferred)) return preferred;
          return found[0] ?? "";
        });
      } catch {
        setModels([]);
      }
    } else {
      setModels([]);
    }
    setStatus("idle");
  }, []);

  useEffect(() => {
    if (!isOpen) {
      hydratedSessionIdRef.current = null;
      seedHandledRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!sessions.loaded || !isOpen) return;
    if (!sessions.activeSessionId) {
      sessions.ensureActiveSession();
    }
  }, [
    sessions.loaded,
    sessions.activeSessionId,
    isOpen,
    sessions.ensureActiveSession,
  ]);

  useEffect(() => {
    if (!sessions.loaded) return;
    const session = sessions.activeSession;
    if (!session) return;
    if (hydratedSessionIdRef.current === session.id) return;
    hydratedSessionIdRef.current = session.id;
    setMessages(session.messages);
    setDroppedCardIds(session.droppedCardIds);
    setContextScope(session.contextScope);
  }, [sessions.loaded, sessions.activeSession]);

  useEffect(() => {
    if (!sessions.loaded || !sessions.activeSessionId) return;
    if (hydratedSessionIdRef.current !== sessions.activeSessionId) return;
    sessions.updateActiveSession({
      messages: toStoredMessages(messages),
      droppedCardIds,
      contextScope,
    });
  }, [
    messages,
    droppedCardIds,
    contextScope,
    sessions.loaded,
    sessions.activeSessionId,
    sessions.updateActiveSession,
  ]);

  useEffect(() => {
    if (!isOpen || !vaultPath || !sessions.loaded) return;
    if (!seedCardIds || seedCardIds.length === 0) return;
    const seedKey = `${vaultPath}:${seedCardIds.join(",")}`;
    if (seedHandledRef.current === seedKey) return;
    seedHandledRef.current = seedKey;
    hydratedSessionIdRef.current = null;
    sessions.createSession({
      droppedCardIds: [...seedCardIds],
      contextScope: "focused",
    });
  }, [isOpen, vaultPath, seedCardIds, sessions.loaded, sessions.createSession]);

  useEffect(() => {
    if (!isOpen || !vaultPath) return;
    let cancelled = false;
    void (async () => {
      const settings = await getSettings();
      if (cancelled) return;
      settingsRef.current = settings;
      const configuredHost =
        settings?.wizard?.host?.trim() || DEFAULT_OLLAMA_HOST;
      setHost(configuredHost);
      await refreshConnection(configuredHost);
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, refreshConnection, vaultPath]);

  // Refresh SQLite index when world data changes during an open session.
  useEffect(() => {
    if (!isOpen || !vaultPath) return;
    void cardCount;
    void linkCount;
    let cancelled = false;
    void fetchWorldCardIndex(vaultPath).then((rows) => {
      if (!cancelled) setIndexRows(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, vaultPath, cardCount, linkCount]);

  const persistModel = useCallback(
    (nextModel: string) => {
      const current = settingsRef.current;
      if (!current) return;
      const updated: AppSettings = {
        ...current,
        wizard: { host, defaultModel: nextModel },
      };
      settingsRef.current = updated;
      void saveSettings(updated).catch(() => {
        // best-effort persistence
      });
    },
    [host],
  );

  const selectModel = useCallback(
    (nextModel: string) => {
      setModel(nextModel);
      persistModel(nextModel);
    },
    [persistModel],
  );

  const addCard = useCallback((cardId: string) => {
    setDroppedCardIds((current) =>
      current.includes(cardId) ? current : [...current, cardId],
    );
    setContextScope("focused");
  }, []);

  const removeCard = useCallback((cardId: string) => {
    setDroppedCardIds((current) => current.filter((id) => id !== cardId));
  }, []);

  const clearCards = useCallback(() => {
    setDroppedCardIds([]);
  }, []);

  const updateMessage = useCallback(
    (id: string, patch: Partial<WizardMessage>) => {
      setMessages((current) =>
        current.map((message) =>
          message.id === id ? { ...message, ...patch } : message,
        ),
      );
    },
    [],
  );

  const wizardGuidelines = useCallback(
    () => settingsRef.current?.wizard?.guidelines?.trim() || "",
    [],
  );

  const buildChatMessages = useCallback(
    (
      userPrompt: string,
      priorMessages: WizardMessage[],
    ): WizardChatMessage[] => {
      const chatMessages: WizardChatMessage[] = [
        { role: "system", content: buildSystemPrompt(wizardGuidelines()) },
      ];
      if (worldContextMessage) {
        chatMessages.push({ role: "user", content: worldContextMessage });
      }
      for (const message of priorMessages) {
        if (message.streaming || message.error || !message.content.trim()) {
          continue;
        }
        chatMessages.push({
          role: message.role,
          content: message.content,
        });
      }
      chatMessages.push({ role: "user", content: userPrompt });
      return chatMessages;
    },
    [worldContextMessage, wizardGuidelines],
  );

  const runGenerateCardFromPrompt = useCallback(
    async (
      cardType: WorldCard["card_type"],
      userPrompt: string,
      displayPrompt: string,
    ) => {
      if (!model || status === "generating") return;

      const userMessage: WizardMessage = {
        id: makeId(),
        role: "user",
        content: displayPrompt,
      };
      const assistantId = makeId();
      setMessages((current) => [
        ...current,
        userMessage,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          streaming: true,
          loadingLabel: "Generating card",
        },
      ]);

      setStatus("generating");
      try {
        const card = await generateCard({
          host,
          model,
          cardType,
          systemPrompt: buildSystemPrompt(wizardGuidelines()),
          contextMessage: worldContextMessage,
          userPrompt: buildCardCreationPrompt(userPrompt, droppedCards),
          position: { x: 0, y: 0 },
        });
        updateMessage(assistantId, {
          streaming: false,
          content: `Created **${card.name}** on the canvas.`,
          generatedCard: card,
          generatedCardAction: "spawn",
        });
        onSpawnGeneratedCard?.(card);
      } catch (error) {
        updateMessage(assistantId, {
          streaming: false,
          error: true,
          content:
            error instanceof Error
              ? error.message
              : "The wizard could not generate a card.",
        });
      } finally {
        setStatus("idle");
      }
    },
    [
      model,
      status,
      host,
      droppedCards,
      worldContextMessage,
      updateMessage,
      wizardGuidelines,
      onSpawnGeneratedCard,
    ],
  );

  const sendChat = useCallback(
    async (promptText: string) => {
      const trimmed = promptText.trim();
      if (!trimmed || !model || status === "generating") return;

      const priorMessages = messages;
      const cardIntent =
        detectCardGenerationIntent(trimmed) ??
        detectCardGenerationFollowUp(trimmed, priorMessages);
      if (cardIntent) {
        await runGenerateCardFromPrompt(
          cardIntent.cardType,
          cardIntent.prompt,
          trimmed,
        );
        return;
      }

      const userMessage: WizardMessage = {
        id: makeId(),
        role: "user",
        content: trimmed,
      };
      const assistantId = makeId();

      setMessages((current) => [
        ...current,
        userMessage,
        { id: assistantId, role: "assistant", content: "", streaming: true },
      ]);

      const controller = new AbortController();
      abortRef.current = controller;
      setStatus("generating");

      try {
        await streamWizardChat({
          host,
          model,
          messages: buildChatMessages(trimmed, priorMessages),
          signal: controller.signal,
          onToken: (_token, accumulated) => {
            updateMessage(assistantId, { content: accumulated });
          },
        });
        updateMessage(assistantId, { streaming: false });
      } catch (error) {
        updateMessage(assistantId, {
          streaming: false,
          error: true,
          content:
            error instanceof Error
              ? error.message
              : "The wizard could not complete the request.",
        });
      } finally {
        abortRef.current = null;
        setStatus("idle");
      }
    },
    [
      model,
      status,
      host,
      messages,
      buildChatMessages,
      updateMessage,
      runGenerateCardFromPrompt,
    ],
  );

  const runPatchCard = useCallback(
    async (preset: WizardActionPreset) => {
      if (!model || status === "generating" || !preset.patchMode) return;
      const targetCard = droppedCards[0];
      if (!targetCard) return;

      const userMessage: WizardMessage = {
        id: makeId(),
        role: "user",
        content: preset.buildPrompt(droppedCards),
      };
      const assistantId = makeId();
      setMessages((current) => [
        ...current,
        userMessage,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          streaming: true,
          loadingLabel: "Updating card",
        },
      ]);

      setStatus("generating");
      const mode = preset.patchMode;
      const fields =
        mode === "fill-gaps"
          ? listEmptyWizardGeneratableFields(targetCard)
          : listWizardGeneratableFields(targetCard.card_type);

      if (fields.length === 0) {
        updateMessage(assistantId, {
          streaming: false,
          error: true,
          content: "No fields to generate on this card.",
        });
        setStatus("idle");
        return;
      }

      const contextMessage = buildPatchContextMessage(
        [targetCard],
        cardsById,
        links,
        worldName,
      );

      try {
        const card = await generateCardPatch({
          host,
          model,
          card: targetCard,
          mode,
          systemPrompt: buildSystemPrompt(wizardGuidelines()),
          contextMessage,
          fields,
        });
        updateMessage(assistantId, {
          streaming: false,
          content: `Updated **${card.name}**.`,
          generatedCard: card,
          generatedCardAction: "apply",
        });
      } catch (error) {
        updateMessage(assistantId, {
          streaming: false,
          error: true,
          content:
            error instanceof Error
              ? error.message
              : "The wizard could not update the card.",
        });
      } finally {
        setStatus("idle");
      }
    },
    [
      model,
      status,
      host,
      droppedCards,
      cardsById,
      links,
      worldName,
      updateMessage,
      wizardGuidelines,
    ],
  );

  const runGenerateCard = useCallback(
    async (preset: WizardActionPreset) => {
      if (!model || status === "generating" || !preset.targetCardType) return;
      const prompt = preset.buildPrompt(droppedCards);
      await runGenerateCardFromPrompt(preset.targetCardType, prompt, prompt);
    },
    [model, status, droppedCards, runGenerateCardFromPrompt],
  );

  const runAction = useCallback(
    (preset: WizardActionPreset) => {
      if (preset.kind === "generate-card") {
        void runGenerateCard(preset);
      } else if (preset.kind === "patch-card") {
        void runPatchCard(preset);
      } else {
        void sendChat(preset.buildPrompt(droppedCards));
      }
    },
    [runGenerateCard, runPatchCard, sendChat, droppedCards],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const startNewSession = useCallback(() => {
    hydratedSessionIdRef.current = null;
    return sessions.createSession();
  }, [sessions.createSession]);

  const switchSession = useCallback(
    (sessionId: string) => {
      hydratedSessionIdRef.current = null;
      sessions.selectSession(sessionId);
    },
    [sessions.selectSession],
  );

  const deleteSession = useCallback(
    (sessionId: string) => {
      if (hydratedSessionIdRef.current === sessionId) {
        hydratedSessionIdRef.current = null;
      }
      sessions.deleteSession(sessionId);
    },
    [sessions.deleteSession],
  );

  const archiveSession = useCallback(
    (sessionId: string) => {
      if (hydratedSessionIdRef.current === sessionId) {
        hydratedSessionIdRef.current = null;
      }
      sessions.archiveSession(sessionId);
    },
    [sessions.archiveSession],
  );

  const unarchiveSession = useCallback(
    (sessionId: string) => {
      sessions.unarchiveSession(sessionId);
    },
    [sessions.unarchiveSession],
  );

  return {
    droppedCardIds,
    droppedCards,
    contextScope,
    messages,
    status,
    host,
    model,
    models,
    healthy,
    activeSessionId: sessions.activeSessionId,
    activeSessions: sessions.activeSessions,
    archivedSessions: sessions.archivedSessions,
    sessionsLoaded: sessions.loaded,
    setHost,
    selectModel,
    refreshConnection,
    addCard,
    removeCard,
    clearCards,
    sendChat,
    runAction,
    stop,
    startNewSession,
    switchSession,
    deleteSession,
    archiveSession,
    unarchiveSession,
  };
}
