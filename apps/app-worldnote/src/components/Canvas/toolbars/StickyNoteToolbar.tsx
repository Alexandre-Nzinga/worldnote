import {
  STICKY_NOTE_COLORS,
  type StickyNoteColor,
} from "@worldnote/shared";
import {
  STICKY_NOTE_BG_CLASS,
  type StickyNoteColorToken,
} from "@worldnote/canvas";
import { MaterialSymbol } from "@worldnote/ui";
import { useEffect, useRef, useState } from "react";

type StickyNoteToolbarProps = {
  heading?: string;
  color: StickyNoteColorToken;
  onChangeHeading?: (heading: string | undefined) => void;
  onChangeColor?: (color: StickyNoteColor) => void;
  onDelete?: () => void;
};

export function StickyNoteToolbar({
  heading,
  color,
  onChangeHeading,
  onChangeColor,
  onDelete,
}: StickyNoteToolbarProps) {
  const [headingDraft, setHeadingDraft] = useState(heading ?? "");
  const headingFocusedRef = useRef(false);

  useEffect(() => {
    if (!headingFocusedRef.current) {
      setHeadingDraft(heading ?? "");
    }
  }, [heading]);

  const handleDelete = () => {
    if (
      !window.confirm("Delete this sticky note? This cannot be undone.")
    ) {
      return;
    }
    onDelete?.();
  };

  return (
    <div
      className="flex items-center gap-2 rounded-xl border border-wn-mono-600 bg-wn-mono-900 px-3 py-2 shadow-lg"
      role="toolbar"
      aria-label="Sticky note options"
    >
      <input
        type="text"
        value={headingDraft}
        placeholder="Heading"
        aria-label="Note heading"
        className="w-32 rounded-lg border border-wn-mono-600 bg-wn-mono-800 px-2 py-1 text-xs text-wn-mono-50 placeholder:text-wn-mono-500 outline-none focus:border-wn-mono-400"
        onChange={(event) => {
          setHeadingDraft(event.target.value);
        }}
        onFocus={() => {
          headingFocusedRef.current = true;
        }}
        onBlur={() => {
          headingFocusedRef.current = false;
          const normalized = headingDraft.trim();
          setHeadingDraft(normalized);
          onChangeHeading?.(normalized || undefined);
        }}
        onKeyDown={(event) => event.stopPropagation()}
      />
      <div className="flex items-center gap-1">
        {STICKY_NOTE_COLORS.map((swatch) => (
          <button
            key={swatch}
            type="button"
            aria-label={`Color ${swatch}`}
            aria-pressed={swatch === color}
            className={`h-6 w-6 rounded border-2 ${
              swatch === color
                ? "border-wn-mono-50 ring-1 ring-wn-mono-50"
                : "border-wn-mono-700 hover:border-wn-mono-400"
            } ${STICKY_NOTE_BG_CLASS[swatch]}`}
            onClick={() => onChangeColor?.(swatch)}
          />
        ))}
      </div>
      <button
        type="button"
        aria-label="Delete note"
        className="flex h-7 w-7 items-center justify-center rounded-lg text-wn-mono-400 hover:bg-wn-mono-800 hover:text-wn-rose-300"
        onClick={handleDelete}
      >
        <MaterialSymbol name="delete" className="text-[18px]" />
      </button>
    </div>
  );
}
