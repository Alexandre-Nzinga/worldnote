import { MaterialSymbol } from "@worldnote/ui";
import { useEffect, useRef } from "react";

export type CanvasStickyNoteContextMenuState = {
  noteId: string;
  x: number;
  y: number;
};

type CanvasStickyNoteContextMenuProps = {
  menu: CanvasStickyNoteContextMenuState | null;
  onClose: () => void;
  onDuplicate: (noteId: string) => void;
  onCopy: (noteId: string) => void;
  onDelete: (noteId: string) => void;
};

const menuClassName =
  "min-w-[10rem] rounded-xl border border-wn-mono-700 bg-wn-mono-800 p-1 shadow-lg";

const itemClassName =
  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-wn-mono-100 transition-colors hover:bg-wn-mono-700 hover:text-wn-mono-50";

export function CanvasStickyNoteContextMenu({
  menu,
  onClose,
  onDuplicate,
  onCopy,
  onDelete,
}: CanvasStickyNoteContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (menuRef.current?.contains(target)) {
        return;
      }
      onClose();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menu, onClose]);

  if (!menu) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Sticky note actions"
      className={`pointer-events-auto fixed z-[100] ${menuClassName}`}
      style={{ left: menu.x, top: menu.y }}
    >
      <button
        type="button"
        role="menuitem"
        className={itemClassName}
        onClick={() => {
          onDuplicate(menu.noteId);
          onClose();
        }}
      >
        <MaterialSymbol name="content_copy" className="text-base" />
        Duplicate
      </button>
      <button
        type="button"
        role="menuitem"
        className={itemClassName}
        onClick={() => {
          onCopy(menu.noteId);
          onClose();
        }}
      >
        <MaterialSymbol name="copy_all" className="text-base" />
        Copy
      </button>
      <button
        type="button"
        role="menuitem"
        className={`${itemClassName} text-danger hover:text-danger`}
        onClick={() => {
          if (window.confirm("Delete this sticky note?")) {
            onDelete(menu.noteId);
          }
          onClose();
        }}
      >
        <MaterialSymbol name="delete" className="text-base" />
        Delete
      </button>
    </div>
  );
}
