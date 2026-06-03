import { Button } from "@worldnote/ui";
import { useCallback, useState } from "react";
import {
  DEFAULT_CANVAS_KEYBOARD_SHORTCUTS,
  formatKeyboardShortcut,
  keyboardShortcutFromEvent,
  normalizeCanvasKeyboardShortcuts,
  type CanvasKeyboardShortcuts,
} from "../../services/settings/keyboardShortcuts.js";
import { modalFieldLabelClassName } from "../Onboarding/fieldClassNames.js";

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
};

export function KeyboardShortcutsSettings({
  value,
  onChange,
  disabled = false,
}: KeyboardShortcutsSettingsProps) {
  const shortcuts = normalizeCanvasKeyboardShortcuts(value);
  const [recordingAction, setRecordingAction] = useState<ShortcutAction | null>(
    null,
  );

  const handleRecordKeyDown = useCallback(
    (event: React.KeyboardEvent, action: ShortcutAction) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.key === "Escape") {
        setRecordingAction(null);
        return;
      }
      const recorded = keyboardShortcutFromEvent(event.nativeEvent);
      if (!recorded) {
        return;
      }
      onChange({
        ...shortcuts,
        [action]: recorded,
      });
      setRecordingAction(null);
    },
    [onChange, shortcuts],
  );

  const resetToDefaults = useCallback(() => {
    onChange({ ...DEFAULT_CANVAS_KEYBOARD_SHORTCUTS });
  }, [onChange]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className={modalFieldLabelClassName}>Canvas shortcuts</span>
        <p className="text-xs text-wn-mono-500">
          Keyboard shortcuts for editing on the world canvas (copy, paste, undo,
          and more).
          Click a shortcut field and press the key combination you want to use.
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {(Object.keys(SHORTCUT_LABELS) as ShortcutAction[]).map((action) => {
          const shortcut = shortcuts[action];
          const isRecording = recordingAction === action;
          return (
            <li
              key={action}
              className="flex items-center justify-between gap-3 rounded-xl border border-wn-mono-700 bg-wn-mono-950 px-3 py-2"
            >
              <span className="text-sm text-wn-mono-100">
                {SHORTCUT_LABELS[action]}
              </span>
              <button
                type="button"
                disabled={disabled}
                aria-label={`${SHORTCUT_LABELS[action]} shortcut`}
                className={[
                  "min-w-28 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                  isRecording
                    ? "border-wn-mono-500 bg-wn-mono-800 text-wn-mono-50"
                    : "border-wn-mono-600 bg-wn-mono-900 text-wn-mono-200 hover:border-wn-mono-500 hover:text-wn-mono-50",
                ].join(" ")}
                onFocus={() => setRecordingAction(action)}
                onBlur={() => {
                  if (recordingAction === action) {
                    setRecordingAction(null);
                  }
                }}
                onKeyDown={(event) => handleRecordKeyDown(event, action)}
              >
                {isRecording
                  ? "Press keys…"
                  : formatKeyboardShortcut(shortcut)}
              </button>
            </li>
          );
        })}
      </ul>

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
