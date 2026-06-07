import { Skeleton } from "../../ui/Skeleton.js";

const LORE_SKELETON_LINES = [
  { id: "a", width: "w-full" },
  { id: "b", width: "w-[94%]" },
  { id: "c", width: "w-full" },
  { id: "d", width: "w-[82%]" },
  { id: "e", width: "w-[90%]" },
  { id: "f", width: "w-[72%]" },
] as const;

const LORE_SKELETON_SECOND_BLOCK = [
  { id: "g", width: "w-full" },
  { id: "h", width: "w-[88%]" },
  { id: "i", width: "w-[76%]" },
  { id: "j", width: "w-[92%]" },
] as const;

type LoreEditorSkeletonProps = {
  className?: string;
};

/** Paragraph-shaped placeholders while WorldWizard generates lore. */
export function LoreEditorSkeleton({
  className = "",
}: LoreEditorSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Generating lore"
      className={["flex flex-col gap-3", className].filter(Boolean).join(" ")}
    >
      {LORE_SKELETON_LINES.map((line) => (
        <Skeleton key={line.id} className={`h-3.5 ${line.width}`} />
      ))}
      <div className="mt-1 flex flex-col gap-3">
        {LORE_SKELETON_SECOND_BLOCK.map((line) => (
          <Skeleton key={line.id} className={`h-3.5 ${line.width}`} />
        ))}
      </div>
    </div>
  );
}
