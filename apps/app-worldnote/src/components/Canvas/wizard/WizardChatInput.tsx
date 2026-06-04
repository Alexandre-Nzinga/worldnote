import {
  CANVAS_CARD_DROP_EVENT,
  CANVAS_CARD_DROP_TARGET_ATTR,
  getCardExternalPointerDragCardId,
  isCanvasCardDropEvent,
  isCardExternalPointerDragActive,
} from "@worldnote/canvas";
import type { WorldCard } from "@worldnote/shared";
import { CARD_TYPE_LABELS } from "@worldnote/shared";
import { EnumComboBox, MaterialSymbol } from "@worldnote/ui";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
} from "react";

import { cardImageSrc } from "../../../services/canvas/cardNodeData.js";
import { cx } from "./cx.js";
import { dragHasCard, readDraggedCardId } from "./dnd.js";

type WizardChatInputProps = {
  cards: WorldCard[];
  cardsById: Record<string, WorldCard>;
  vaultPath: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  busy: boolean;
  canSend: boolean;
  model: string;
  models: string[];
  onModelChange: (model: string) => void;
  onRefreshModels: () => void;
  onAddCard: (cardId: string) => void;
  onRemoveCard: (cardId: string) => void;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  onStop: () => void;
};

const toolbarIconClassName =
  "flex h-8 w-8 items-center justify-center rounded-lg text-wn-mono-400 transition-colors hover:bg-wn-mono-800 hover:text-wn-mono-50 disabled:cursor-not-allowed disabled:opacity-40";

function CardToken({
  card,
  vaultPath,
  onRemove,
  preview = false,
}: {
  card: WorldCard;
  vaultPath: string;
  onRemove?: () => void;
  preview?: boolean;
}) {
  const imageUrl = cardImageSrc(vaultPath, card.image_path);
  const typeLabel = CARD_TYPE_LABELS[card.card_type] ?? card.card_type;
  return (
    <div
      className={cx(
        "group flex items-center gap-2 rounded-full py-1 pl-1",
        preview
          ? "border border-dashed border-wn-mono-50/60 bg-wn-mono-50/10 pr-2"
          : "border border-wn-mono-800 bg-wn-mono-900/80 pr-2",
      )}
    >
      <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-wn-mono-800 text-xs font-semibold text-wn-mono-200">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          card.name.charAt(0).toUpperCase()
        )}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="max-w-32 truncate text-xs font-medium text-wn-mono-100">
          {card.name}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-wn-mono-500">
          {typeLabel}
        </span>
      </span>
      {onRemove ? (
        <button
          type="button"
          aria-label={`Remove ${card.name}`}
          className="rounded-full p-0.5 text-wn-mono-500 transition-colors hover:bg-wn-mono-800 hover:text-wn-mono-100"
          onClick={onRemove}
        >
          <MaterialSymbol name="close" className="text-sm" />
        </button>
      ) : null}
    </div>
  );
}

function isPointerOverElement(
  element: HTMLElement,
  clientX: number,
  clientY: number,
): boolean {
  const rect = element.getBoundingClientRect();
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}

export function WizardChatInput({
  cards,
  cardsById,
  vaultPath,
  value,
  placeholder,
  disabled = false,
  busy,
  canSend,
  model,
  models,
  onModelChange,
  onRefreshModels,
  onAddCard,
  onRemoveCard,
  onChange,
  onKeyDown,
  onSubmit,
  onStop,
}: WizardChatInputProps) {
  const [isOver, setIsOver] = useState(false);
  const [previewCardId, setPreviewCardId] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const droppedCardIds = useMemo(
    () => new Set(cards.map((card) => card.id)),
    [cards],
  );

  const previewCard = useMemo(() => {
    if (!previewCardId || droppedCardIds.has(previewCardId)) {
      return null;
    }
    return cardsById[previewCardId] ?? null;
  }, [cardsById, droppedCardIds, previewCardId]);

  const clearPreview = useCallback(() => {
    setPreviewCardId(null);
  }, []);

  const updatePreviewFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const zone = dropRef.current;
      if (!zone) {
        return;
      }

      const over = isPointerOverElement(zone, clientX, clientY);
      setIsOver(over);

      if (!over) {
        clearPreview();
        return;
      }

      if (isCardExternalPointerDragActive()) {
        setPreviewCardId(getCardExternalPointerDragCardId());
      }
    },
    [clearPreview],
  );

  useEffect(() => {
    const element = dropRef.current;
    if (!element) {
      return;
    }

    const onCanvasCardDrop = (event: Event) => {
      event.stopPropagation();
      if (!isCanvasCardDropEvent(event)) {
        return;
      }
      clearPreview();
      setIsOver(false);
      if (event.detail.cardId) {
        onAddCard(event.detail.cardId);
      }
    };

    element.addEventListener(CANVAS_CARD_DROP_EVENT, onCanvasCardDrop);
    return () => {
      element.removeEventListener(CANVAS_CARD_DROP_EVENT, onCanvasCardDrop);
    };
  }, [clearPreview, onAddCard]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (!isCardExternalPointerDragActive()) {
        return;
      }
      updatePreviewFromPointer(event.clientX, event.clientY);
    };

    const onPointerEnd = () => {
      clearPreview();
      setIsOver(false);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerEnd);
    window.addEventListener("pointercancel", onPointerEnd);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
    };
  }, [clearPreview, updatePreviewFromPointer]);

  const onDragEnter = (event: DragEvent) => {
    if (!dragHasCard(event.dataTransfer)) {
      return;
    }
    event.preventDefault();
    setIsOver(true);
    const cardId = readDraggedCardId(event.dataTransfer);
    if (cardId) {
      setPreviewCardId(cardId);
    }
  };

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (!dragHasCard(event.dataTransfer)) {
      return;
    }
    event.dataTransfer.dropEffect = "copy";
    setIsOver(true);
    const cardId = readDraggedCardId(event.dataTransfer);
    if (cardId) {
      setPreviewCardId(cardId);
    }
  };

  const onDragLeave = (event: DragEvent) => {
    const next = event.relatedTarget;
    if (next instanceof Node && dropRef.current?.contains(next)) {
      return;
    }
    setIsOver(false);
    clearPreview();
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsOver(false);
    clearPreview();
    if (!dragHasCard(event.dataTransfer)) {
      return;
    }
    const cardId = readDraggedCardId(event.dataTransfer);
    if (cardId) {
      onAddCard(cardId);
    }
  };

  const modelOptions = useMemo(
    () => models.map((name) => ({ value: name, label: name })),
    [models],
  );

  return (
    <div
      ref={dropRef}
      {...{ [CANVAS_CARD_DROP_TARGET_ATTR]: "" }}
      className={cx(
        "flex flex-col rounded-2xl bg-wn-mono-950 px-4 py-3 transition-colors",
        isOver && "bg-wn-mono-50/5 ring-1 ring-wn-mono-50/30",
      )}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {cards.length > 0 || previewCard ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {cards.map((card) => (
            <CardToken
              key={card.id}
              card={card}
              vaultPath={vaultPath}
              onRemove={() => onRemoveCard(card.id)}
            />
          ))}
          {previewCard ? (
            <CardToken
              key={`preview-${previewCard.id}`}
              card={previewCard}
              vaultPath={vaultPath}
              preview
            />
          ) : null}
        </div>
      ) : null}

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder={placeholder}
        disabled={disabled}
        className="scrollbar-wn max-h-32 min-h-6 w-full resize-none bg-transparent text-sm leading-relaxed text-wn-mono-100 outline-none placeholder:text-wn-mono-500 disabled:cursor-not-allowed"
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          aria-label="Drag cards from the canvas grip"
          title="Drag cards from the canvas grip"
          className={toolbarIconClassName}
          disabled={disabled}
        >
          <MaterialSymbol name="add" className="text-xl" />
        </button>

        <div className="flex min-w-0 items-center gap-0.5">
          <EnumComboBox
            id="wizard-model"
            label="Model"
            hideLabel
            variant="inline"
            value={model}
            options={modelOptions}
            onChange={onModelChange}
            disabled={models.length === 0 || disabled}
            placeholder="No models found"
          />

          <button
            type="button"
            aria-label="Refresh models"
            className={toolbarIconClassName}
            onClick={onRefreshModels}
          >
            <MaterialSymbol name="refresh" className="text-lg" />
          </button>

          {busy ? (
            <button
              type="button"
              aria-label="Stop"
              className={toolbarIconClassName}
              onClick={onStop}
            >
              <MaterialSymbol name="stop" className="text-lg" />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Send"
              className={cx(
                toolbarIconClassName,
                canSend && "text-wn-mono-50 hover:bg-wn-mono-800",
              )}
              onClick={onSubmit}
              disabled={!canSend}
            >
              <MaterialSymbol name="send" className="text-lg" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
