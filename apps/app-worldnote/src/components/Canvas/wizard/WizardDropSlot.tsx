import type { WorldCard } from "@worldnote/shared";
import { CARD_TYPE_LABELS } from "@worldnote/shared";
import { MaterialSymbol } from "@worldnote/ui";
import { useState, type DragEvent } from "react";

import { cardImageSrc } from "../../../services/canvas/cardNodeData.js";
import { cx } from "./cx.js";
import { dragHasCard, readDraggedCardId } from "./dnd.js";

type WizardDropSlotProps = {
  cards: WorldCard[];
  vaultPath: string;
  onAddCard: (cardId: string) => void;
  onRemoveCard: (cardId: string) => void;
};

function CardToken({
  card,
  vaultPath,
  onRemove,
}: {
  card: WorldCard;
  vaultPath: string;
  onRemove: () => void;
}) {
  const imageUrl = cardImageSrc(vaultPath, card.image_path);
  const typeLabel = CARD_TYPE_LABELS[card.card_type] ?? card.card_type;
  return (
    <div className="group flex items-center gap-2 rounded-full border border-wn-mono-700 bg-wn-mono-950 py-1 pl-1 pr-2">
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
        <span className="max-w-[8rem] truncate text-xs font-medium text-wn-mono-100">
          {card.name}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-wn-mono-500">
          {typeLabel}
        </span>
      </span>
      <button
        type="button"
        aria-label={`Remove ${card.name}`}
        className="rounded-full p-0.5 text-wn-mono-500 transition-colors hover:bg-wn-mono-800 hover:text-wn-mono-100"
        onClick={onRemove}
      >
        <MaterialSymbol name="close" className="text-sm" />
      </button>
    </div>
  );
}

export function WizardDropSlot({
  cards,
  vaultPath,
  onAddCard,
  onRemoveCard,
}: WizardDropSlotProps) {
  const [isOver, setIsOver] = useState(false);

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (!dragHasCard(event.dataTransfer)) return;
    event.dataTransfer.dropEffect = "copy";
    setIsOver(true);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsOver(false);
    if (!dragHasCard(event.dataTransfer)) return;
    const cardId = readDraggedCardId(event.dataTransfer);
    if (cardId) {
      onAddCard(cardId);
    }
  };

  return (
    <div
      className={cx(
        "flex min-h-[3.5rem] flex-wrap items-center gap-2 rounded-xl border border-dashed px-3 py-2 transition-colors",
        isOver
          ? "border-wn-azure-500 bg-wn-azure-500/10"
          : "border-wn-mono-700 bg-wn-mono-950/40",
      )}
      onDragOver={onDragOver}
      onDragLeave={() => setIsOver(false)}
      onDrop={onDrop}
    >
      {cards.length === 0 ? (
        <span className="flex items-center gap-2 text-xs text-wn-mono-500">
          <MaterialSymbol name="drag_pan" className="text-base" />
          Drag from a card&apos;s grip (top-left) into the wizard
        </span>
      ) : (
        cards.map((card) => (
          <CardToken
            key={card.id}
            card={card}
            vaultPath={vaultPath}
            onRemove={() => onRemoveCard(card.id)}
          />
        ))
      )}
    </div>
  );
}
