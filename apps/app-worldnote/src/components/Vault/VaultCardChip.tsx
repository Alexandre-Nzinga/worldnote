import { MotionPressable, Pill } from "@worldnote/ui";
import type { LibraryCard } from "../../services/library/listAllCards.js";
import { CARD_TYPE_LABELS } from "@worldnote/shared";
import { RemixIcon } from "../Canvas/RemixIcon.js";

type VaultCardChipProps = {
  card: LibraryCard;
  draggable?: boolean;
};

const chipClassName = [
  "flex w-full items-center gap-3 rounded-2xl border border-wn-mono-800",
  "bg-wn-mono-900/60 px-3 py-2 text-left text-wn-mono-100 shadow-sm",
  "hover:border-wn-mono-700 hover:bg-wn-mono-900",
].join(" ");

const typePillClassName = "bg-wn-mono-800";

export function VaultCardChip({ card, draggable = true }: VaultCardChipProps) {
  return (
    <MotionPressable
      className={chipClassName}
      draggable={draggable}
      onDragStart={(event) => {
        if (!draggable) {
          event.preventDefault();
          return;
        }
        event.dataTransfer.setData(
          "application/worldnote-card-ref",
          JSON.stringify({ sourceWorldPath: card.worldPath, cardId: card.cardId }),
        );
        event.dataTransfer.setData("text/plain", `${card.name}`);
        event.dataTransfer.effectAllowed = "copy";
      }}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-wn-mono-800 text-wn-mono-50">
        <RemixIcon
          name={
            {
              character: "ri-user-line",
              location: "ri-map-pin-line",
              item: "ri-gift-line",
              vehicle: "ri-car-line",
              flora: "ri-plant-line",
              fauna: "ri-bear-smile-line",
              building: "ri-building-line",
              structure: "ri-ancient-gate-line",
              species: "ri-bug-line",
            }[card.cardType] ?? "ri-sticky-note-line"
          }
          className="text-[18px]"
        />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="truncate text-sm font-semibold text-wn-mono-50">
          {card.name}
        </div>
        <div className="flex items-center gap-2">
          <Pill size="sm" className={typePillClassName} textClassName="text-wn-mono-50">
            {CARD_TYPE_LABELS[card.cardType as keyof typeof CARD_TYPE_LABELS] ??
              card.cardType}
          </Pill>
          <span className="truncate text-xs text-wn-mono-400">{card.worldName}</span>
        </div>
      </div>
    </MotionPressable>
  );
}

