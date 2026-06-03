import { useEffect, useRef } from "react";

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return Boolean(
    target.closest(
      'input, textarea, select, [contenteditable="true"], [contenteditable=""]',
    ),
  );
}

function isMultilineEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return Boolean(
    target.closest(
      'textarea, [contenteditable="true"], [contenteditable=""]',
    ),
  );
}

type UsePanelHotkeysOptions = {
  enabled: boolean;
  onEscape: () => void;
  onSave?: () => void;
  canSave?: boolean;
  onDelete?: () => void;
  canDelete?: boolean;
};

/**
 * Panel shortcuts: Escape to dismiss, Enter to save (not in multiline fields), Delete to delete.
 */
export function usePanelHotkeys({
  enabled,
  onEscape,
  onSave,
  canSave = true,
  onDelete,
  canDelete = true,
}: UsePanelHotkeysOptions) {
  const onEscapeRef = useRef(onEscape);
  const onSaveRef = useRef(onSave);
  const onDeleteRef = useRef(onDelete);

  onEscapeRef.current = onEscape;
  onSaveRef.current = onSave;
  onDeleteRef.current = onDelete;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onEscapeRef.current();
        return;
      }

      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        onSaveRef.current &&
        canSave &&
        !isMultilineEditableTarget(event.target)
      ) {
        event.preventDefault();
        onSaveRef.current();
        return;
      }

      if (event.key === "Delete" && onDeleteRef.current && canDelete) {
        if (isEditableTarget(event.target)) {
          return;
        }
        event.preventDefault();
        onDeleteRef.current();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canDelete, canSave, enabled]);
}
