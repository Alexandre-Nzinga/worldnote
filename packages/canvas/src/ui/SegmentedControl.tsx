import { MaterialSymbol } from "@worldnote/ui";

export type SegmentedControlSegment = {
  id: string;
  ariaLabel: string;
  icon?: string;
  content?: string;
  onPress?: () => void;
};

export type SegmentedControlProps = {
  ariaLabel: string;
  segments: SegmentedControlSegment[];
  className?: string;
};

const segmentBaseClass =
  "flex h-8 min-w-8 items-center justify-center px-2.5 text-xs font-medium text-wn-mono-300 transition-colors";

const interactiveClass =
  "hover:bg-wn-mono-800 hover:text-wn-mono-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wn-indigo-500 focus-visible:ring-inset";

/** Horizontal segmented control for compact canvas chrome (e.g. zoom). */
export function SegmentedControl({
  ariaLabel,
  segments,
  className,
}: SegmentedControlProps) {
  return (
    <fieldset
      aria-label={ariaLabel}
      className={[
        "m-0 inline-flex min-w-0 overflow-hidden rounded-lg border border-wn-mono-700 bg-wn-mono-900 p-0 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {segments.map((segment, index) => {
        const isInteractive = Boolean(segment.onPress);
        const inner = segment.icon ? (
          <MaterialSymbol name={segment.icon} className="text-base" />
        ) : (
          <span className="tabular-nums">{segment.content}</span>
        );

        const sharedClass = [
          segmentBaseClass,
          isInteractive ? interactiveClass : "cursor-default text-wn-mono-200",
          index > 0 ? "border-l border-wn-mono-700" : "",
        ].join(" ");

        if (isInteractive) {
          return (
            <button
              key={segment.id}
              type="button"
              aria-label={segment.ariaLabel}
              onClick={segment.onPress}
              className={sharedClass}
            >
              {inner}
            </button>
          );
        }

        return (
          <output
            key={segment.id}
            aria-label={segment.ariaLabel}
            className={sharedClass}
          >
            {inner}
          </output>
        );
      })}
    </fieldset>
  );
}
