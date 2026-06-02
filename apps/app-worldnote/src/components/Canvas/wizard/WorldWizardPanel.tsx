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

import { getAvailableActions } from "../../../services/wizard/index.js";
import { cx } from "./cx.js";
import { dragHasCard, readDraggedCardId } from "./dnd.js";
import { WizardActionChips } from "./WizardActionChips.js";
import { WizardDropSlot } from "./WizardDropSlot.js";
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

      <div className="flex items-center gap-2 border-b border-wn-mono-800 px-4 py-2">
        <label
          htmlFor="wizard-model"
          className="text-xs font-medium text-wn-mono-400"
        >
          Model
        </label>
        <select
          id="wizard-model"
          value={wizard.model}
          onChange={(event) => wizard.selectModel(event.target.value)}
          disabled={wizard.models.length === 0}
          className="min-w-0 flex-1 rounded-lg border border-wn-mono-700 bg-wn-mono-950 px-2 py-1 text-xs text-wn-mono-100 outline-none focus:border-wn-azure-500 disabled:opacity-50"
        >
          {wizard.models.length === 0 ? (
            <option value="">No models found</option>
          ) : (
            wizard.models.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))
          )}
        </select>
        <button
          type="button"
          aria-label="Refresh models"
          className="rounded-lg p-1 text-wn-mono-400 transition-colors hover:bg-wn-mono-800 hover:text-wn-mono-100"
          onClick={() => void wizard.refreshConnection(wizard.host)}
        >
          <MaterialSymbol name="refresh" className="text-base" />
        </button>
      </div>

      <div className="px-4 pt-3">
        <WizardDropSlot
          cards={wizard.droppedCards}
          vaultPath={vaultPath}
          onAddCard={wizard.addCard}
          onRemoveCard={wizard.removeCard}
        />
      </div>

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
              Drag cards in, then ask the wizard to simulate conversations,
              events, or breed new cards.
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

      <div className="flex flex-col gap-2 border-t border-wn-mono-800 px-4 py-3">
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
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            onDragOver={handlePanelDragOver}
            onDrop={handlePanelDrop}
            rows={2}
            placeholder={
              wizard.model
                ? "Ask the wizard…"
                : "Connect a local model to begin"
            }
            disabled={!wizard.model}
            className="scrollbar-wn min-h-0 flex-1 resize-none rounded-xl border border-wn-mono-700 bg-wn-mono-950 px-3 py-2 text-sm text-wn-mono-100 outline-none placeholder:text-wn-mono-600 focus:border-wn-azure-500 disabled:opacity-50"
          />
          {busy ? (
            <button
              type="button"
              aria-label="Stop"
              onClick={wizard.stop}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-wn-mono-800 text-wn-mono-100 transition-colors hover:bg-wn-mono-700"
            >
              <MaterialSymbol name="stop" className="text-lg" />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Send"
              onClick={submit}
              disabled={!canSend}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-wn-azure-500 text-wn-mono-50 transition-colors hover:bg-wn-azure-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <MaterialSymbol name="send" className="text-lg" />
            </button>
          )}
        </div>
      </div>
      </div>
    </AnimatedPanel>
  );
}
