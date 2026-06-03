import { MaterialSymbol } from "@worldnote/ui";
import { useEffect, useRef } from "react";

export type CanvasImageContextMenuState = {
  imageId: string;
  x: number;
  y: number;
};

type CanvasImageContextMenuProps = {
  menu: CanvasImageContextMenuState | null;
  onClose: () => void;
  onDuplicate: (imageId: string) => void;
  onDelete: (imageId: string) => void;
};

const menuClassName =
  "min-w-[10rem] rounded-xl border border-wn-mono-700 bg-wn-mono-800 p-1 shadow-lg";

const itemClassName =
  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-wn-mono-100 transition-colors hover:bg-wn-mono-700 hover:text-wn-mono-50";

export function CanvasImageContextMenu({
  menu,
  onClose,
  onDuplicate,
  onDelete,
}: CanvasImageContextMenuProps) {
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
      aria-label="Image actions"
      className={`pointer-events-auto fixed z-[100] ${menuClassName}`}
      style={{ left: menu.x, top: menu.y }}
    >
      <button
        type="button"
        role="menuitem"
        className={itemClassName}
        onClick={() => {
          onDuplicate(menu.imageId);
          onClose();
        }}
      >
        <MaterialSymbol name="content_copy" className="text-base" />
        Duplicate
      </button>
      <button
        type="button"
        role="menuitem"
        className={`${itemClassName} text-danger hover:text-danger`}
        onClick={() => {
          if (window.confirm("Delete this image?")) {
            onDelete(menu.imageId);
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
