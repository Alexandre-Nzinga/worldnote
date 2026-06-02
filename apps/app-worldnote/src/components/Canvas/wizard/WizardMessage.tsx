import { CARD_TYPE_LABELS, type WorldCard } from "@worldnote/shared";
import { MaterialSymbol } from "@worldnote/ui";

import { MarkdownView } from "../inspector/MarkdownView.js";
import { cx } from "./cx.js";
import type { WizardMessage as WizardMessageData } from "./useWorldWizard.js";

type WizardMessageProps = {
  message: WizardMessageData;
  onSpawn: (card: WorldCard) => void;
};

function GeneratedCardPreview({
  card,
  onSpawn,
}: {
  card: WorldCard;
  onSpawn: (card: WorldCard) => void;
}) {
  const typeLabel = CARD_TYPE_LABELS[card.card_type] ?? card.card_type;
  return (
    <div className="mt-2 rounded-xl border border-wn-mono-700 bg-wn-mono-950 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-wn-mono-50">
            {card.name}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-wn-mono-500">
            {typeLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onSpawn(card)}
          className="flex items-center gap-1 rounded-full bg-wn-azure-500 px-3 py-1.5 text-xs font-semibold text-wn-mono-50 transition-colors hover:bg-wn-azure-600"
        >
          <MaterialSymbol name="add_circle" className="text-sm" />
          Spawn onto Canvas
        </button>
      </div>
      {card.description ? (
        <p className="mt-2 text-xs leading-relaxed text-wn-mono-300">
          {card.description}
        </p>
      ) : null}
    </div>
  );
}

export function WizardMessage({ message, onSpawn }: WizardMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cx(
          "max-w-[90%] rounded-2xl px-3 py-2 text-sm",
          isUser
            ? "bg-wn-azure-500 text-wn-mono-50"
            : message.error
              ? "border border-wn-red-500/60 bg-wn-red-500/10 text-wn-red-300"
              : "bg-wn-mono-800 text-wn-mono-100",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <>
            <MarkdownView content={message.content} />
            {message.streaming ? (
              <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-wn-mono-400 align-middle" />
            ) : null}
            {message.generatedCard ? (
              <GeneratedCardPreview
                card={message.generatedCard}
                onSpawn={onSpawn}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
