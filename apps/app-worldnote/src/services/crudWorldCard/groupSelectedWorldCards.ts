import type { WorldCard } from "@worldnote/shared";
import { createWorldCard } from "./createWorldCard.js";
import { updateWorldCard } from "./updateWorldCard.js";

type Position = { x: number; y: number };

/** Center of the axis-aligned bounds of member card positions. */
export function centerPositionForGroup(members: WorldCard[]): Position {
  if (members.length === 0) {
    return { x: 0, y: 0 };
  }

  let minX = members[0].position.x;
  let minY = members[0].position.y;
  let maxX = minX;
  let maxY = minY;

  for (const card of members.slice(1)) {
    const { x, y } = card.position;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
  };
}

export async function groupSelectedWorldCards({
  vault,
  members,
}: {
  vault: string;
  members: WorldCard[];
}): Promise<{ group: WorldCard; members: WorldCard[] }> {
  if (members.length < 2) {
    throw new Error("Select at least two cards to create a group");
  }

  const position = centerPositionForGroup(members);
  const group = await createWorldCard({
    vault,
    cardType: "group",
    position,
  });

  const updatedMembers: WorldCard[] = [];
  for (const member of members) {
    if (member.id === group.id) {
      continue;
    }
    updatedMembers.push(
      await updateWorldCard(vault, {
        ...member,
        parent_id: group.id,
      }),
    );
  }

  return { group, members: updatedMembers };
}
