import { getBodyTextStyle } from "@worldnote/ui";

type BulkSelectionToolbarProps = {
  selectedCount: number;
};

function countLabel(count: number): string {
  return count === 1 ? "1 selected" : `${count} selected`;
}

export function BulkSelectionToolbar({
  selectedCount,
}: BulkSelectionToolbarProps) {
  if (selectedCount <= 1) {
    return null;
  }

  return (
    <p
      className="rounded-full border border-wn-mono-600 bg-wn-mono-900 px-3 py-1.5 font-medium text-wn-mono-50 shadow-lg select-none"
      style={getBodyTextStyle("small")}
      aria-live="polite"
    >
      {countLabel(selectedCount)}
    </p>
  );
}
