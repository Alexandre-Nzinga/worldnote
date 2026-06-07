import {
  CARD_TYPE_LABELS,
  normalizeCardImageDisplay,
  type WorldCard,
} from "@worldnote/shared";
import { CardTypePlaceholder } from "@worldnote/canvas";
import { Eyebrow } from "@worldnote/ui";
import { cardImageSrc } from "../../../services/canvas/cardNodeData.js";
import {
  inspectorSectionClassName,
  inspectorSectionEyebrowClassName,
} from "./inspectorFieldStyles.js";

type GroupMembersSectionProps = {
  members: WorldCard[];
  vaultPath: string;
  onNavigateToCard?: (cardId: string) => void;
};

function MemberThumbnail({
  card,
  vaultPath,
}: {
  card: WorldCard;
  vaultPath: string;
}) {
  const imageDisplay = normalizeCardImageDisplay(
    card.image_fit,
    card.image_position,
  );
  const imageUrl = cardImageSrc(vaultPath, card.image_path);

  return (
    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-wn-mono-700 bg-wn-mono-800">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full object-cover"
          style={{
            objectFit: imageDisplay.fit === "fill" ? "cover" : "contain",
            objectPosition: `${imageDisplay.position.x}% ${imageDisplay.position.y}%`,
          }}
        />
      ) : (
        <CardTypePlaceholder
          cardType={card.card_type}
          className="h-full w-full opacity-80"
        />
      )}
    </div>
  );
}

export function GroupMembersSection({
  members,
  vaultPath,
  onNavigateToCard,
}: GroupMembersSectionProps) {
  if (members.length === 0) {
    return null;
  }

  return (
    <section className={`${inspectorSectionClassName} shrink-0`}>
      <Eyebrow as="h3" className={inspectorSectionEyebrowClassName}>
        Cards in group
      </Eyebrow>
      <ul className="flex flex-col gap-3">
        {members.map((member) => {
          const typeLabel = CARD_TYPE_LABELS[member.card_type];
          const row = (
            <>
              <MemberThumbnail card={member} vaultPath={vaultPath} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-wn-mono-100">
                  {member.name}
                </p>
                <p className="truncate text-xs text-wn-mono-500">{typeLabel}</p>
              </div>
            </>
          );

          if (onNavigateToCard) {
            return (
              <li key={member.id}>
                <button
                  type="button"
                  onClick={() => onNavigateToCard(member.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-wn-mono-800 bg-wn-mono-950/40 px-3 py-2 text-left transition-colors hover:border-wn-mono-700 hover:bg-wn-mono-950/80"
                >
                  {row}
                </button>
              </li>
            );
          }

          return (
            <li
              key={member.id}
              className="flex items-center gap-3 rounded-xl border border-wn-mono-800 bg-wn-mono-950/40 px-3 py-2"
            >
              {row}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
