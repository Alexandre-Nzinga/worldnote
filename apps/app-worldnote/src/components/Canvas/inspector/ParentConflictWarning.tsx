import type { WorldCard } from "@worldnote/shared";
import { MaterialSymbol } from "@worldnote/ui";
import type { ParentConflict } from "../../../services/familyTree/buildFamilyGraph.js";

type ParentConflictWarningProps = {
  conflicts: ParentConflict[];
  cardsById: Record<string, WorldCard>;
};

function cardName(cardsById: Record<string, WorldCard>, cardId: string): string {
  return cardsById[cardId]?.name ?? "Unknown";
}

function roleLabel(role: ParentConflict["role"]): string {
  return role === "father" ? "father" : "mother";
}

function formatConflict(
  conflict: ParentConflict,
  cardsById: Record<string, WorldCard>,
): string {
  const role = roleLabel(conflict.role);
  const canonical = cardName(cardsById, conflict.canonicalParentId);
  const alternates = conflict.alternateParentIds
    .map((id) => cardName(cardsById, id))
    .join(", ");
  return `Two ${role}s linked — family tree uses ${canonical} (${alternates} ignored for kinship). Remove extra links to resolve.`;
}

export function ParentConflictWarning({
  conflicts,
  cardsById,
}: ParentConflictWarningProps) {
  if (conflicts.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 rounded-lg border border-wn-amber-500/35 bg-wn-amber-950/40 px-3 py-2.5">
      <MaterialSymbol
        name="warning"
        className="mt-0.5 shrink-0 text-base text-wn-amber-400"
      />
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-sm text-wn-amber-100">
        {conflicts.map((conflict) => (
          <li key={`${conflict.role}-${conflict.canonicalParentId}`}>
            {formatConflict(conflict, cardsById)}
          </li>
        ))}
      </ul>
    </div>
  );
}
