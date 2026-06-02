import { useEffect } from "react";

type UseCanvasCommandPaletteShortcutOptions = {
  enabled?: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export function useCanvasCommandPaletteShortcut({
  enabled = true,
  isOpen,
  onOpen,
  onClose,
}: UseCanvasCommandPaletteShortcutOptions) {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod || event.key.toLowerCase() !== "k") {
        return;
      }
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.isContentEditable &&
        !isOpen
      ) {
        return;
      }
      event.preventDefault();
      if (isOpen) {
        onClose();
      } else {
        onOpen();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, isOpen, onClose, onOpen]);
}
