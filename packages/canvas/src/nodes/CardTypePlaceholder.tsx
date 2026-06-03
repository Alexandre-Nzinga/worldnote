import type { HTMLAttributes } from "react";

import { CARD_TYPE_EMBLEMS, GenericEmblem } from "./cardTypeEmblems.js";
import type { WorldNoteCardType } from "./card-visual-config.js";

type CardTypePlaceholderProps = {
  cardType?: WorldNoteCardType | string;
} & Pick<HTMLAttributes<SVGSVGElement>, "className">;

const EMBLEM = "var(--color-wn-mono-300)";

function isWorldNoteCardType(value: string): value is WorldNoteCardType {
  return value in CARD_TYPE_EMBLEMS;
}

export function CardTypePlaceholder({
  cardType,
  className,
}: CardTypePlaceholderProps) {
  const normalized = (cardType ?? "").trim();
  const emblem =
    normalized && isWorldNoteCardType(normalized) ? (
      CARD_TYPE_EMBLEMS[normalized]
    ) : (
      <GenericEmblem color={EMBLEM} />
    );

  return (
    <svg
      className={className}
      viewBox="0 0 512 512"
      role="img"
      aria-label={normalized ? `${normalized} placeholder` : "Card placeholder"}
      preserveAspectRatio="xMidYMid meet"
    >
      <g style={{ color: EMBLEM }}>{emblem}</g>
    </svg>
  );
}
