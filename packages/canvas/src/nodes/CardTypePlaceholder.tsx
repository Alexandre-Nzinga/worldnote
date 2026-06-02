import type { HTMLAttributes } from "react";

import { CARD_TYPE_EMBLEMS, GenericEmblem } from "./cardTypeEmblems.js";
import type { WorldNoteCardType } from "./card-visual-config.js";

type CardTypePlaceholderProps = {
  cardType?: WorldNoteCardType | string;
} & Pick<HTMLAttributes<SVGSVGElement>, "className">;

const BORDER = "var(--color-wn-mono-900)";
const BODY = "var(--color-wn-mono-600)";
const SHADOW = "var(--color-wn-mono-700)";
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
      {/* Thick border */}
      <rect
        x="44"
        y="44"
        width="424"
        height="424"
        rx="110"
        style={{ fill: BORDER }}
      />

      {/* Body */}
      <rect
        x="66"
        y="66"
        width="380"
        height="380"
        rx="96"
        style={{ fill: BODY }}
      />

      {/* Inner crescent shadow to mimic sticker layering */}
      <path
        d="M118 366c24 44 70 76 138 86 88 12 166-14 214-60 18-18 30-38 38-60v76c0 44-36 80-80 80H156c-44 0-80-36-80-80v-42Z"
        opacity="0.9"
        style={{ fill: SHADOW }}
      />

      {/* Emblem */}
      <g transform="translate(0 0)" style={{ color: EMBLEM }}>
        {emblem}
      </g>
    </svg>
  );
}
