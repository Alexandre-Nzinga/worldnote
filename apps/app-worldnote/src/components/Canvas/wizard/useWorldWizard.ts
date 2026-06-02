import type { Link, WorldCard } from "@worldnote/shared";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  getSettings,
  saveSettings,
  type AppSettings,
} from "../../../services/settings/settings.js";
import {
  buildSystemPrompt,
  buildWorldContextMessage,
  checkOllamaHealth,
  DEFAULT_OLLAMA_HOST,
  fetchWorldCardIndex,
  generateCard,
  listOllamaModels,
  streamWizardChat,
  type CardIndexRow,
  type WizardActionPreset,
  type WizardChatMessage,
} from "../../../services/wizard/index.js";

export type WizardStatus = "idle" | "connecting" | "generating";

export type WizardMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  /** A generated card awaiting "Spawn onto Canvas". */
  generatedCard?: WorldCard;
  error?: boolean;
};

type UseWorldWizardArgs = {
  vaultPath: string;
  worldName: string;
  cardsById: Record<string, WorldCard>;
  links: Link[];
  isOpen: boolean;
};

function makeId(): string {
  return crypto.randomUUID();
}

export function useWorldWizard({
  vaultPath,
  worldName,
  cardsById,
  links,
  isOpen,
}: UseWorldWizardArgs) {
  const [droppedCardIds, setDroppedCardIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<WizardMessage[]>([]);
  const [status, setStatus] = useState<WizardStatus>("idle");
  const [host, setHost] = useState(DEFAULT_OLLAMA_HOST);
  const [model, setModel] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [indexRows, setIndexRows] = useState<CardIndexRow[]>([]);

  const settingsRef = useRef<AppSettings | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sessionVaultRef = useRef<string | null>(null);

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
          })
        : "",
    [vaultPath, worldName, cardsById, links, indexRows, droppedCardIds],
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

  // Per-world session: reset chat when the user switches worlds.
  useEffect(() => {
    if (!isOpen || !vaultPath) return;
    if (sessionVaultRef.current !== null && sessionVaultRef.current !== vaultPath) {
      setMessages([]);
      setDroppedCardIds([]);
    }
    sessionVaultRef.current = vaultPath;
  }, [isOpen, vaultPath]);

  useEffect(() => {
    if (!isOpen) {
      sessionVaultRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !vaultPath) return;
    let cancelled = false;
    void (async () => {
      const settings = await getSettings();
      if (cancelled) return;
      settingsRef.current = settings;
      const configuredHost = settings?.wizard?.host?.trim() || DEFAULT_OLLAMA_HOST;
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

  const buildChatMessages = useCallback(
    (
      userPrompt: string,
      priorMessages: WizardMessage[],
    ): WizardChatMessage[] => {
      const chatMessages: WizardChatMessage[] = [
        { role: "system", content: buildSystemPrompt() },
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
    [worldContextMessage],
  );

  const sendChat = useCallback(
    async (promptText: string) => {
      const trimmed = promptText.trim();
      if (!trimmed || !model || status === "generating") return;

      const userMessage: WizardMessage = {
        id: makeId(),
        role: "user",
        content: trimmed,
      };
      const assistantId = makeId();
      const priorMessages = messages;

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
    [model, status, host, messages, buildChatMessages, updateMessage],
  );

  const runGenerateCard = useCallback(
    async (preset: WizardActionPreset) => {
      if (!model || status === "generating" || !preset.targetCardType) return;

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
          content: "Generating card…",
          streaming: true,
        },
      ]);

      setStatus("generating");
      const userPrompt = preset.buildPrompt(droppedCards);
      try {
        const card = await generateCard({
          host,
          model,
          cardType: preset.targetCardType,
          systemPrompt: buildSystemPrompt(),
          contextMessage: worldContextMessage,
          userPrompt,
          position: { x: 0, y: 0 },
        });
        updateMessage(assistantId, {
          streaming: false,
          content: `Generated **${card.name}**.`,
          generatedCard: card,
        });
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
    ],
  );

  const runAction = useCallback(
    (preset: WizardActionPreset) => {
      if (preset.kind === "generate-card") {
        void runGenerateCard(preset);
      } else {
        void sendChat(preset.buildPrompt(droppedCards));
      }
    },
    [runGenerateCard, sendChat, droppedCards],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    droppedCardIds,
    droppedCards,
    messages,
    status,
    host,
    model,
    models,
    healthy,
    setHost,
    selectModel,
    refreshConnection,
    addCard,
    removeCard,
    clearCards,
    sendChat,
    runAction,
    stop,
  };
}
