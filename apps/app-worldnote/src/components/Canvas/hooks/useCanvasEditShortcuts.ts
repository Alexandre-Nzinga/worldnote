import { useEffect, useMemo, useRef } from "react";
import {
  matchesDeleteKeyboardShortcut,
  matchesKeyboardShortcut,
  normalizeCanvasKeyboardShortcuts,
  type CanvasKeyboardShortcuts,
} from "../../../services/settings/keyboardShortcuts.js";
import { isEditableTarget } from "./usePanelHotkeys.js";

type UseCanvasEditShortcutsOptions = {
  enabled?: boolean;
  shortcuts?: CanvasKeyboardShortcuts;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onSelectAll: () => void;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
};

export function useCanvasEditShortcuts({
  enabled = true,
  shortcuts: shortcutsProp,
  onCopy,
  onCut,
  onPaste,
  onDuplicate,
  onSelectAll,
  onDelete,
  onUndo,
  onRedo,
}: UseCanvasEditShortcutsOptions) {
  const shortcuts = useMemo(
    () => normalizeCanvasKeyboardShortcuts(shortcutsProp),
    [shortcutsProp],
  );
  const onCopyRef = useRef(onCopy);
  const onCutRef = useRef(onCut);
  const onPasteRef = useRef(onPaste);
  const onDuplicateRef = useRef(onDuplicate);
  const onSelectAllRef = useRef(onSelectAll);
  const onDeleteRef = useRef(onDelete);
  const onUndoRef = useRef(onUndo);
  const onRedoRef = useRef(onRedo);

  onCopyRef.current = onCopy;
  onCutRef.current = onCut;
  onPasteRef.current = onPaste;
  onDuplicateRef.current = onDuplicate;
  onSelectAllRef.current = onSelectAll;
  onDeleteRef.current = onDelete;
  onUndoRef.current = onUndo;
  onRedoRef.current = onRedo;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || isEditableTarget(event.target)) {
        return;
      }

      if (matchesKeyboardShortcut(event, shortcuts.undo)) {
        event.preventDefault();
        onUndoRef.current();
        return;
      }

      if (matchesKeyboardShortcut(event, shortcuts.redo)) {
        event.preventDefault();
        onRedoRef.current();
        return;
      }

      if (matchesKeyboardShortcut(event, shortcuts.selectAll)) {
        event.preventDefault();
        onSelectAllRef.current();
        return;
      }

      if (matchesDeleteKeyboardShortcut(event, shortcuts.delete)) {
        event.preventDefault();
        onDeleteRef.current();
        return;
      }

      if (matchesKeyboardShortcut(event, shortcuts.copy)) {
        event.preventDefault();
        onCopyRef.current();
        return;
      }

      if (matchesKeyboardShortcut(event, shortcuts.cut)) {
        event.preventDefault();
        onCutRef.current();
        return;
      }

      if (matchesKeyboardShortcut(event, shortcuts.paste)) {
        event.preventDefault();
        onPasteRef.current();
        return;
      }

      if (matchesKeyboardShortcut(event, shortcuts.duplicate)) {
        event.preventDefault();
        onDuplicateRef.current();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, shortcuts]);
}
