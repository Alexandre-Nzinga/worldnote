import type { CardImageFit, CardImagePosition } from "./card-image-display.js";
import { CardImageView } from "./CardImageView.js";
import { CardTypePlaceholder } from "./CardTypePlaceholder.js";
import type { GroupMemberPreview } from "./group-member-preview.js";

type GroupMembersVisualProps = {
  members: GroupMemberPreview[];
  className?: string;
};

const MAX_VISIBLE = 4;

/** Mosaic of member card images inside a group card. */
export function GroupMembersVisual({
  members,
  className = "",
}: GroupMembersVisualProps) {
  const visible = members.slice(0, MAX_VISIBLE);
  const overflow = members.length - visible.length;

  if (visible.length === 0) {
    return null;
  }

  const gridClass =
    visible.length === 1
      ? "grid-cols-1 grid-rows-1"
      : visible.length === 2
        ? "grid-cols-2 grid-rows-1"
        : "grid-cols-2 grid-rows-2";

  return (
    <div
      className={`absolute inset-0 grid gap-px bg-wn-mono-950 ${gridClass} ${className}`}
      aria-hidden
    >
      {visible.map((member, index) => (
        <MemberTile
          key={member.cardId}
          member={member}
          showOverflowBadge={overflow > 0 && index === visible.length - 1}
          overflowCount={overflow}
        />
      ))}
    </div>
  );
}

type MemberTileProps = {
  member: GroupMemberPreview;
  showOverflowBadge: boolean;
  overflowCount: number;
};

function MemberTile({
  member,
  showOverflowBadge,
  overflowCount,
}: MemberTileProps) {
  return (
    <div className="relative min-h-0 min-w-0 overflow-hidden bg-wn-mono-800">
      {member.imageUrl ? (
        <CardImageView
          src={member.imageUrl}
          fit={member.imageFit}
          position={member.imagePosition}
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <CardTypePlaceholder
          cardType={member.cardType}
          className="absolute inset-0 h-full w-full opacity-70"
        />
      )}
      {showOverflowBadge ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/55">
          <span className="text-lg font-semibold text-white">
            +{overflowCount}
          </span>
        </div>
      ) : null}
    </div>
  );
}
