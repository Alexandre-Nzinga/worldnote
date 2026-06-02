import { MaterialSymbol } from "@worldnote/ui";
import type Quill from "quill";

type LoreToolbarProps = {
  quill: Quill;
  format: Record<string, unknown>;
  onInsertImage: () => void;
  onInsertGallery: () => void;
};

function ToolbarButton({
  active,
  label,
  icon,
  onPress,
}: {
  active?: boolean;
  label: string;
  icon: string;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      // Keep focus inside the editor so formatting applies to the selection.
      onMouseDown={(event) => event.preventDefault()}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
        active
          ? "bg-wn-mono-700 text-wn-mono-50"
          : "text-wn-mono-300 hover:bg-wn-mono-800 hover:text-wn-mono-50"
      }`}
      onClick={onPress}
    >
      <MaterialSymbol name={icon} className="text-base" />
    </button>
  );
}

export function LoreToolbar({
  quill,
  format,
  onInsertImage,
  onInsertGallery,
}: LoreToolbarProps) {
  const toggle = (name: string, value: unknown = true) => {
    quill.focus();
    quill.format(name, format[name] ? false : value, "user");
  };

  const setAlign = (value: false | "center" | "right") => {
    quill.focus();
    quill.format("align", value, "user");
  };

  const align = format.align;

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-wn-mono-800 px-2 py-1.5">
      <ToolbarButton
        label="Bold"
        icon="format_bold"
        active={Boolean(format.bold)}
        onPress={() => toggle("bold")}
      />
      <ToolbarButton
        label="Italic"
        icon="format_italic"
        active={Boolean(format.italic)}
        onPress={() => toggle("italic")}
      />
      <ToolbarButton
        label="Underline"
        icon="format_underlined"
        active={Boolean(format.underline)}
        onPress={() => toggle("underline")}
      />
      <span className="mx-1 h-5 w-px bg-wn-mono-700" aria-hidden />
      <ToolbarButton
        label="Align left"
        icon="format_align_left"
        active={!align}
        onPress={() => setAlign(false)}
      />
      <ToolbarButton
        label="Align center"
        icon="format_align_center"
        active={align === "center"}
        onPress={() => setAlign("center")}
      />
      <ToolbarButton
        label="Align right"
        icon="format_align_right"
        active={align === "right"}
        onPress={() => setAlign("right")}
      />
      <span className="mx-1 h-5 w-px bg-wn-mono-700" aria-hidden />
      <ToolbarButton
        label="Bullet list"
        icon="format_list_bulleted"
        active={format.list === "bullet"}
        onPress={() => toggle("list", "bullet")}
      />
      <ToolbarButton
        label="Numbered list"
        icon="format_list_numbered"
        active={format.list === "ordered"}
        onPress={() => toggle("list", "ordered")}
      />
      <span className="mx-1 h-5 w-px bg-wn-mono-700" aria-hidden />
      <ToolbarButton label="Insert image" icon="image" onPress={onInsertImage} />
      <ToolbarButton
        label="Insert gallery"
        icon="photo_library"
        onPress={onInsertGallery}
      />
      <span className="ml-auto hidden text-xs text-wn-mono-500 sm:inline">
        Type [[ to link a card
      </span>
    </div>
  );
}
