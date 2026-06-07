import type { Link, WorldCard } from "@worldnote/shared";
import {
  AnimatedPanel,
  Button,
  CloseIconButton,
  getHeadingProps,
  MaterialSymbol,
  WorldNoteLogo,
} from "@worldnote/ui";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
} from "react";

import { CANVAS_CARD_DROP_TARGET_ATTR } from "@worldnote/canvas";
import { useSettings } from "../../../hooks/useSettings.js";
import { getAvailableActions } from "../../../services/wizard/index.js";
import { cx } from "./cx.js";
import { dragHasCard, readDraggedCardId } from "./dnd.js";
import { useWizardCardDropListener } from "./useWizardCardDropListener.js";
import { WizardActionChips } from "./WizardActionChips.js";
import { WizardChatInput } from "./WizardChatInput.js";
import { WizardMessage } from "./WizardMessage.js";
import { WizardSessionList } from "./WizardSessionList.js";
import { useWorldWizard } from "./useWorldWizard.js";

const panelClassName =
  "pointer-events-auto absolute right-4 top-4 z-30 flex max-h-[calc(100vh-7rem)] w-[min(100%,24rem)] flex-col overflow-hidden rounded-2xl border border-wn-mono-800 bg-wn-mono-900 shadow-2xl";

type WorldWizardPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  worldName: string;
  cardsById: Record<string, WorldCard>;
  links: Link[];
  vaultPath: string;
  onSpawnCard: (card: WorldCard) => void;
  onApplyCard?: (card: WorldCard) => void;
  seedCardIds?: string[] | null;
};

function StatusDot({ healthy }: { healthy: boolean | null }) {
  return (
    <span
      className={cx(
        "h-2 w-2 rounded-full",
        healthy === true && "bg-wn-green-500",
        healthy === false && "bg-wn-red-500",
        healthy === null && "bg-wn-mono-600",
      )}
      title={
        healthy === true
          ? "Ollama connected"
          : healthy === false
            ? "Ollama unreachable"
            : "Checking connection…"
      }
    />
  );
}

export function WorldWizardPanel({
  isOpen,
  onClose,
  worldName,
  cardsById,
  links,
  vaultPath,
  onSpawnCard,
  onApplyCard,
  seedCardIds = null,
}: WorldWizardPanelProps) {
  const wizard = useWorldWizard({
    vaultPath,
    worldName,
    cardsById,
    links,
    isOpen,
    seedCardIds,
    onSpawnGeneratedCard: onSpawnCard,
  });
  const [input, setInput] = useState("");
  const [showSessions, setShowSessions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const quickCommands = useSettings(
    (state) => state.settings?.wizard?.quickCommands,
  );

  const actions = useMemo(
    () => getAvailableActions(wizard.droppedCards, quickCommands),
    [wizard.droppedCards, quickCommands],
  );

  const busy = wizard.status === "generating";
  const canSend = Boolean(wizard.model) && !busy && input.trim().length > 0;

  useWizardCardDropListener(wizard.addCard, isOpen);

  useEffect(() => {
    if (!isOpen) {
      setShowSessions(false);
    }
  }, [isOpen]);

  const scrollKey = `${wizard.messages.length}:${wizard.messages.at(-1)?.content.length ?? 0}`;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || scrollKey === "0:0") return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [scrollKey]);

  const submit = () => {
    if (!canSend) return;
    void wizard.sendChat(input);
    setInput("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  const handlePanelDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!dragHasCard(event.dataTransfer)) return;
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const handlePanelDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!dragHasCard(event.dataTransfer)) return;
      const cardId = readDraggedCardId(event.dataTransfer);
      if (cardId) {
        wizard.addCard(cardId);
      }
    },
    [wizard.addCard],
  );

  return (
    <AnimatedPanel isOpen={isOpen} className={panelClassName}>
      <div
        {...{ [CANVAS_CARD_DROP_TARGET_ATTR]: "" }}
        className="flex min-h-0 flex-1 flex-col"
        onDragOver={handlePanelDragOver}
        onDrop={handlePanelDrop}
      >
      <header className="flex items-center justify-between border-b border-wn-mono-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <WorldNoteLogo
            variant="icon"
            format="svg"
            tone="white"
            className="h-4 w-4 opacity-90"
            alt=""
          />
          <h2 {...getHeadingProps("h6", { tone: "inverse", weight: "bold" })}>
            WorldWizard
          </h2>
          <StatusDot healthy={wizard.healthy} />
        </div>
        <div className="flex items-center gap-1">
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            aria-label="New conversation"
            title="New conversation"
            onPress={() => {
              wizard.startNewSession();
              setShowSessions(false);
            }}
            className="text-wn-mono-400"
          >
            <MaterialSymbol name="edit_square" className="text-base" />
          </Button>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            aria-label="Conversation history"
            title="Conversation history"
            onPress={() => setShowSessions((current) => !current)}
            className={showSessions ? "text-wn-mono-50" : "text-wn-mono-400"}
          >
            <MaterialSymbol name="history" className="text-base" />
          </Button>
          <CloseIconButton aria-label="Close WorldWizard" onPress={onClose} />
        </div>
      </header>

      <div
        ref={scrollRef}
        className="scrollbar-wn flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3"
      >
        {showSessions ? (
          <WizardSessionList
            activeSessionId={wizard.activeSessionId}
            activeSessions={wizard.activeSessions}
            archivedSessions={wizard.archivedSessions}
            onSelectSession={(sessionId) => {
              wizard.switchSession(sessionId);
              setShowSessions(false);
            }}
            onStartNewSession={() => {
              wizard.startNewSession();
              setShowSessions(false);
            }}
            onArchiveSession={wizard.archiveSession}
            onUnarchiveSession={wizard.unarchiveSession}
            onDeleteSession={wizard.deleteSession}
            onBack={() => setShowSessions(false)}
          />
        ) : wizard.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-xs text-wn-mono-500">
            <WorldNoteLogo
              variant="icon"
              format="svg"
              tone="white"
              className="h-6 w-6 opacity-75"
              alt=""
            />
            <p className="max-w-[16rem]">
              {wizard.contextScope === "focused" && wizard.droppedCards.length > 0
                ? `${wizard.droppedCards.length} card(s) loaded as context. Drop more cards or chat to expand.`
                : "Try \"create a wizard character\" to spawn a card, or open history to revisit past conversations."}
            </p>
          </div>
        ) : (
          wizard.messages.map((message) => (
            <WizardMessage
              key={message.id}
              message={message}
              onSpawn={onSpawnCard}
              onApply={onApplyCard}
            />
          ))
        )}
      </div>

      <div className="flex flex-col gap-2 px-4 py-3">
        {showSessions ? null : actions.length > 0 ? (
          <WizardActionChips
            actions={actions}
            disabled={busy || !wizard.model}
            onRun={wizard.runAction}
          />
        ) : null}
        {showSessions ? null : wizard.healthy === false ? (
          <p className="text-xs text-wn-red-400">
            Could not reach Ollama at {wizard.host}. Make sure it is running.
          </p>
        ) : null}
        {showSessions ? null : (
        <WizardChatInput
          cards={wizard.droppedCards}
          cardsById={cardsById}
          vaultPath={vaultPath}
          value={input}
          onChange={setInput}
          onKeyDown={onKeyDown}
          onAddCard={wizard.addCard}
          onRemoveCard={wizard.removeCard}
          disabled={!wizard.model}
          busy={busy}
          canSend={canSend}
          model={wizard.model}
          models={wizard.models}
          onModelChange={wizard.selectModel}
          onRefreshModels={() => void wizard.refreshConnection(wizard.host)}
          onSubmit={submit}
          onStop={wizard.stop}
          placeholder={
            wizard.model
              ? "How can I help you today?"
              : "Connect a local model to begin"
          }
        />
        )}
      </div>
      </div>
    </AnimatedPanel>
  );
}
