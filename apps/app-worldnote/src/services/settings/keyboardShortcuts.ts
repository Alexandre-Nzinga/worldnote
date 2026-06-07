export type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
};

export type CanvasKeyboardShortcuts = {
  copy: KeyboardShortcut;
  cut: KeyboardShortcut;
  paste: KeyboardShortcut;
  duplicate: KeyboardShortcut;
  selectAll: KeyboardShortcut;
  delete: KeyboardShortcut;
  undo: KeyboardShortcut;
  redo: KeyboardShortcut;
};

export const DEFAULT_CANVAS_KEYBOARD_SHORTCUTS: CanvasKeyboardShortcuts = {
  copy: { key: "c", ctrl: true },
  cut: { key: "x", ctrl: true },
  paste: { key: "v", ctrl: true },
  duplicate: { key: "d", ctrl: true },
  selectAll: { key: "a", ctrl: true },
  delete: { key: "Delete" },
  undo: { key: "z", ctrl: true },
  redo: { key: "y", ctrl: true },
};

const MODIFIER_KEYS = new Set(["Control", "Meta", "Alt", "Shift", "OS"]);

const SINGLE_KEY_SHORTCUTS = new Set(["Delete", "Backspace"]);

export function normalizeCanvasKeyboardShortcuts(
  value: CanvasKeyboardShortcuts | undefined,
): CanvasKeyboardShortcuts {
  if (!value) {
    return { ...DEFAULT_CANVAS_KEYBOARD_SHORTCUTS };
  }
  const defaults = DEFAULT_CANVAS_KEYBOARD_SHORTCUTS;
  return {
    copy: normalizeShortcut(value.copy, defaults.copy),
    cut: normalizeShortcut(value.cut, defaults.cut),
    paste: normalizeShortcut(value.paste, defaults.paste),
    duplicate: normalizeShortcut(value.duplicate, defaults.duplicate),
    selectAll: normalizeShortcut(value.selectAll, defaults.selectAll),
    delete: normalizeShortcut(value.delete, defaults.delete),
    undo: normalizeShortcut(value.undo, defaults.undo),
    redo: normalizeShortcut(value.redo, defaults.redo),
  };
}

function normalizeShortcut(
  shortcut: KeyboardShortcut | undefined,
  fallback: KeyboardShortcut,
): KeyboardShortcut {
  if (!shortcut?.key?.trim()) {
    return { ...fallback };
  }
  return {
    key: shortcut.key.trim(),
    ctrl: shortcut.ctrl ?? fallback.ctrl,
    meta: shortcut.meta ?? fallback.meta,
    shift: shortcut.shift ?? fallback.shift,
    alt: shortcut.alt ?? fallback.alt,
  };
}

/** True when the shortcut uses Ctrl/Cmd as a modifier. */
export function shortcutUsesMod(shortcut: KeyboardShortcut): boolean {
  return Boolean(shortcut.ctrl || shortcut.meta);
}

export function matchesKeyboardShortcut(
  event: KeyboardEvent,
  shortcut: KeyboardShortcut,
): boolean {
  const wantsMod = shortcutUsesMod(shortcut);
  const hasMod = event.ctrlKey || event.metaKey;
  if (wantsMod !== hasMod) {
    return false;
  }
  if (Boolean(shortcut.alt) !== event.altKey) {
    return false;
  }
  if (Boolean(shortcut.shift) !== event.shiftKey) {
    return false;
  }

  const pressed = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const expected =
    shortcut.key.length === 1 ? shortcut.key.toLowerCase() : shortcut.key;
  return pressed === expected;
}

/** Matches delete binding; Backspace also triggers when bound to Delete. */
export function matchesDeleteKeyboardShortcut(
  event: KeyboardEvent,
  shortcut: KeyboardShortcut,
): boolean {
  if (matchesKeyboardShortcut(event, shortcut)) {
    return true;
  }
  if (
    shortcut.key === "Delete" &&
    !shortcutUsesMod(shortcut) &&
    !shortcut.alt &&
    !shortcut.shift &&
    event.key === "Backspace" &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !event.shiftKey
  ) {
    return true;
  }
  return false;
}

export function formatKeyboardShortcut(shortcut: KeyboardShortcut): string {
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
  const parts: string[] = [];
  if (shortcutUsesMod(shortcut)) {
    parts.push(isMac ? "⌘" : "Ctrl");
  }
  if (shortcut.alt) {
    parts.push(isMac ? "⌥" : "Alt");
  }
  if (shortcut.shift) {
    parts.push(isMac ? "⇧" : "Shift");
  }
  const keyLabel =
    shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
  parts.push(keyLabel);
  return isMac ? parts.join("") : parts.join("+");
}

export function keyboardShortcutFromEvent(
  event: KeyboardEvent,
): KeyboardShortcut | null {
  if (MODIFIER_KEYS.has(event.key)) {
    return null;
  }

  const hasMod = event.ctrlKey || event.metaKey;

  if (!hasMod && !event.altKey && !event.shiftKey) {
    if (SINGLE_KEY_SHORTCUTS.has(event.key)) {
      return { key: event.key };
    }
    return null;
  }

  return {
    key: event.key.length === 1 ? event.key.toLowerCase() : event.key,
    ctrl: event.ctrlKey ? true : undefined,
    meta: event.metaKey ? true : undefined,
    alt: event.altKey ? true : undefined,
    shift: event.shiftKey ? true : undefined,
  };
}
