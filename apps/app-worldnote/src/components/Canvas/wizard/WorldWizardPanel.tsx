import type { Link, WorldCard } from "@worldnote/shared";
import { AnimatedPanel, MaterialSymbol, WorldNoteLogo } from "@worldnote/ui";
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
import { getAvailableActions } from "../../../services/wizard/index.js";
import { cx } from "./cx.js";
import { dragHasCard, readDraggedCardId } from "./dnd.js";
import { useWizardCardDropListener } from "./useWizardCardDropListener.js";
import { WizardActionChips } from "./WizardActionChips.js";
import { WizardChatInput } from "./WizardChatInput.js";
import { WizardMessage } from "./WizardMessage.js";
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
}: WorldWizardPanelProps) {
  const wizard = useWorldWizard({
    vaultPath,
    worldName,
    cardsById,
    links,
    isOpen,
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const actions = useMemo(
    () => getAvailableActions(wizard.droppedCards),
    [wizard.droppedCards],
  );

  const busy = wizard.status === "generating";
  const canSend = Boolean(wizard.model) && !busy && input.trim().length > 0;

  useWizardCardDropListener(wizard.addCard, isOpen);

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
          <h2 className="text-sm font-bold text-wn-mono-50">WorldWizard</h2>
          <StatusDot healthy={wizard.healthy} />
        </div>
        <button
          type="button"
          aria-label="Close WorldWizard"
          className="rounded-lg bg-wn-mono-950/80 px-2 py-1 text-sm text-wn-mono-300 transition-colors hover:bg-wn-mono-800 hover:text-wn-mono-50"
          onClick={onClose}
        >
          <MaterialSymbol name="close" className="text-base" />
        </button>
      </header>

      <div
        ref={scrollRef}
        className="scrollbar-wn flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3"
      >
        {wizard.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-xs text-wn-mono-500">
            <WorldNoteLogo
              variant="icon"
              format="svg"
              tone="white"
              className="h-6 w-6 opacity-75"
              alt=""
            />
            <p className="max-w-[16rem]">
              Drop cards into the chat box, then ask the wizard to simulate
              conversations, events, or breed new cards.
            </p>
          </div>
        ) : (
          wizard.messages.map((message) => (
            <WizardMessage
              key={message.id}
              message={message}
              onSpawn={onSpawnCard}
            />
          ))
        )}
      </div>

      <div className="flex flex-col gap-2 px-4 py-3">
        {actions.length > 0 ? (
          <WizardActionChips
            actions={actions}
            disabled={busy || !wizard.model}
            onRun={wizard.runAction}
          />
        ) : null}
        {wizard.healthy === false ? (
          <p className="text-xs text-wn-red-400">
            Could not reach Ollama at {wizard.host}. Make sure it is running.
          </p>
        ) : null}
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
      </div>
      </div>
    </AnimatedPanel>
  );
}
