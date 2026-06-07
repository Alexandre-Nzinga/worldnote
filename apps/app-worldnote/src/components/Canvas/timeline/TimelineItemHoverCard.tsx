import { CardTypePlaceholder, type WorldNoteCardType } from "@worldnote/canvas";
import { getBodyTextStyle } from "@worldnote/ui";
import type { CSSProperties } from "react";
import type {
  TimelineItemKind,
  TimelineItemPreview,
} from "../../../services/timeline/buildTimelineItems.js";

const CARD_CHROME_BORDER_WIDTH_PX = 5;

type TimelineItemHoverCardProps = {
  preview: TimelineItemPreview;
  itemKind: TimelineItemKind;
  style: CSSProperties;
};

function cardVisualType(
  preview: TimelineItemPreview,
  itemKind: TimelineItemKind,
): WorldNoteCardType | undefined {
  if (preview.cardType === "character" || preview.cardType === "event") {
    return preview.cardType;
  }
  return undefined;
}

function PeriodHoverCard({
  preview,
  style,
}: {
  preview: TimelineItemPreview;
  style: CSSProperties;
}) {
  return (
    <div
      className="pointer-events-none w-44 overflow-hidden rounded-wn-card border border-wn-border bg-wn-surface shadow-xl"
      style={style}
      role="tooltip"
    >
      <div className="px-3 py-2.5">
        <p
          className="truncate font-semibold text-wn-text"
          style={getBodyTextStyle("small")}
        >
          {preview.title}
        </p>
      </div>
      <div className="border-t border-wn-border px-3 py-1.5 text-center">
        <p
          className="font-medium text-wn-text-muted"
          style={getBodyTextStyle("xs")}
        >
          {preview.dateLabel}
        </p>
      </div>
    </div>
  );
}

export function TimelineItemHoverCard({
  preview,
  itemKind,
  style,
}: TimelineItemHoverCardProps) {
  if (itemKind === "chronology") {
    return <PeriodHoverCard preview={preview} style={style} />;
  }

  const cardType = cardVisualType(preview, itemKind);

  return (
    <div
      className="pointer-events-none w-44 overflow-hidden shadow-xl"
      style={{
        ...style,
        borderRadius: "var(--radius-wn-card)",
      }}
      role="tooltip"
    >
      <div
        className="overflow-hidden bg-wn-mono-950"
        style={{ padding: CARD_CHROME_BORDER_WIDTH_PX }}
      >
        <div
          className="relative aspect-16/10 w-full overflow-hidden bg-wn-mono-900"
          style={{
            borderRadius: `calc(var(--radius-wn-card) - ${CARD_CHROME_BORDER_WIDTH_PX}px)`,
          }}
        >
          {preview.imageUrl ? (
            <img
              src={preview.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <CardTypePlaceholder
              cardType={cardType ?? itemKind}
              className="absolute inset-0 m-auto h-1/2 w-1/2 opacity-35"
            />
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-2">
            <p
              className="truncate font-semibold leading-tight text-white"
              style={getBodyTextStyle("small")}
            >
              {preview.title}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-wn-mono-800 bg-wn-mono-950 px-2.5 py-1.5 text-center">
        <p
          className="font-medium text-wn-mono-100"
          style={getBodyTextStyle("xs")}
        >
          {preview.dateLabel}
        </p>
      </div>
    </div>
  );
}
