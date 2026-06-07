import { Button, wnDescriptionClassName, wnTitleClassName } from "@worldnote/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_CANVAS_KEYBOARD_SHORTCUTS,
  formatKeyboardShortcut,
  keyboardShortcutFromEvent,
  normalizeCanvasKeyboardShortcuts,
  type CanvasKeyboardShortcuts,
} from "../../services/settings/keyboardShortcuts.js";
import { objectKeys } from "../../services/objectKeys.js";
import {
  settingsPanelClassName,
  settingsRowClassName,
  settingsRowListClassName,
  settingsShortcutKeyClassName,
  settingsShortcutKeyRecordingClassName,
} from "./settingsStyles.js";

type ShortcutAction = keyof CanvasKeyboardShortcuts;

const SHORTCUT_LABELS: Record<ShortcutAction, string> = {
  copy: "Copy selection",
  cut: "Cut selection",
  paste: "Paste",
  duplicate: "Duplicate selection",
  selectAll: "Select all",
  delete: "Delete selection",
  undo: "Undo",
  redo: "Redo",
};

type KeyboardShortcutsSettingsProps = {
  value: CanvasKeyboardShortcuts;
  onChange: (next: CanvasKeyboardShortcuts) => void;
  disabled?: boolean;
  showHeading?: boolean;
};

export function KeyboardShortcutsSettings({
  value,
  onChange,
  disabled = false,
  showHeading = true,
}: KeyboardShortcutsSettingsProps) {
  const shortcuts = normalizeCanvasKeyboardShortcuts(value);
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const [recordingAction, setRecordingAction] = useState<ShortcutAction | null>(
    null,
  );

  useEffect(() => {
    if (!recordingAction) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (event.key === "Escape") {
        setRecordingAction(null);
        return;
      }

      const recorded = keyboardShortcutFromEvent(event);
      if (!recorded) {
        return;
      }

      onChange({
        ...shortcutsRef.current,
        [recordingAction]: recorded,
      });
      setRecordingAction(null);
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [onChange, recordingAction]);

  const startRecording = useCallback(
    (action: ShortcutAction) => {
      if (disabled) {
        return;
      }
      setRecordingAction((current) => (current === action ? null : action));
    },
    [disabled],
  );

  const resetToDefaults = useCallback(() => {
    onChange({ ...DEFAULT_CANVAS_KEYBOARD_SHORTCUTS });
  }, [onChange]);

  return (
    <div className="flex flex-col gap-4">
      {showHeading ? (
        <div>
          <span className={wnTitleClassName}>Canvas shortcuts</span>
          <p className={`mt-1.5 ${wnDescriptionClassName}`}>
            Keyboard shortcuts for editing on the world canvas. Click a field and
            press the key combination you want to use.
          </p>
        </div>
      ) : null}

      <section className={settingsPanelClassName}>
        <ul className={settingsRowListClassName}>
          {objectKeys(SHORTCUT_LABELS).map((action) => {
            const shortcut = shortcuts[action];
            const isRecording = recordingAction === action;
            return (
              <li
                key={action}
                className={`${settingsRowClassName} flex items-center justify-between gap-4`}
              >
                <span className="text-sm font-medium text-wn-text">
                  {SHORTCUT_LABELS[action]}
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  aria-pressed={isRecording}
                  aria-label={`${SHORTCUT_LABELS[action]} shortcut`}
                  className={
                    isRecording
                      ? settingsShortcutKeyRecordingClassName
                      : settingsShortcutKeyClassName
                  }
                  onClick={() => startRecording(action)}
                >
                  {isRecording
                    ? "Press keys…"
                    : formatKeyboardShortcut(shortcut)}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <Button
        variant="secondary"
        size="sm"
        isDisabled={disabled}
        className="w-fit"
        onPress={resetToDefaults}
      >
        Reset shortcuts to defaults
      </Button>
    </div>
  );
}
