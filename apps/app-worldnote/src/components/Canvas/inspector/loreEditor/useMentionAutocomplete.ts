import { useCallback, useEffect, useRef, useState } from "react";
import type Quill from "quill";
import type { MentionListItem, MentionListRef } from "./MentionList.js";
import type { LoreOptionsGetter } from "./loreExtensionOptions.js";

type MentionPopupState = {
  open: boolean;
  items: MentionListItem[];
  top: number;
  left: number;
};

const CLOSED: MentionPopupState = { open: false, items: [], top: 0, left: 0 };

type UseMentionAutocompleteArgs = {
  quill: Quill | null;
  getOptions: LoreOptionsGetter;
};

/**
 * Implements `[[` card-mention autocomplete on top of Quill, reusing the
 * shared `MentionList` for rendering and keyboard navigation.
 */
export function useMentionAutocomplete({
  quill,
  getOptions,
}: UseMentionAutocompleteArgs) {
  const [popup, setPopup] = useState<MentionPopupState>(CLOSED);
  const listRef = useRef<MentionListRef>(null);
  // Index where the active `[[` trigger starts.
  const triggerStartRef = useRef<number | null>(null);
  // Mirror of open state for the keydown listener (avoids re-binding).
  const popupOpenRef = useRef(false);
  popupOpenRef.current = popup.open;

  const close = useCallback(() => {
    triggerStartRef.current = null;
    setPopup((prev) => (prev.open ? CLOSED : prev));
  }, []);

  const buildItems = useCallback(
    (query: string): MentionListItem[] => {
      const { cardsById, cardId } = getOptions();
      const q = query.toLowerCase().trim();
      return Object.values(cardsById)
        .filter((card) => card.id !== cardId)
        .filter((card) => !q || card.name.toLowerCase().includes(q))
        .slice(0, 12)
        .map((card) => ({ id: card.id, label: card.name }));
    },
    [getOptions],
  );

  const refresh = useCallback(() => {
    if (!quill) {
      return;
    }
    if (getOptions().readOnly) {
      close();
      return;
    }
    const selection = quill.getSelection();
    if (!selection || selection.length > 0) {
      close();
      return;
    }
    const cursor = selection.index;
    const textBefore = quill.getText(0, cursor);
    const triggerIndex = textBefore.lastIndexOf("[[");
    if (triggerIndex === -1) {
      close();
      return;
    }
    const query = textBefore.slice(triggerIndex + 2);
    // Abort if the trigger was closed or spans a line break.
    if (query.includes("]") || query.includes("\n")) {
      close();
      return;
    }
    const bounds = quill.getBounds(triggerIndex);
    const rootRect = quill.root.getBoundingClientRect();
    if (!bounds) {
      close();
      return;
    }
    triggerStartRef.current = triggerIndex;
    setPopup({
      open: true,
      items: buildItems(query),
      top: rootRect.top + bounds.bottom + 4,
      left: rootRect.left + bounds.left,
    });
  }, [quill, getOptions, buildItems, close]);

  const select = useCallback(
    (item: MentionListItem) => {
      if (!quill) {
        return;
      }
      const start = triggerStartRef.current;
      const selection = quill.getSelection();
      if (start === null || !selection) {
        close();
        return;
      }
      const length = selection.index - start;
      quill.deleteText(start, length, "user");
      quill.insertEmbed(
        start,
        "card-mention",
        { id: item.id, label: item.label },
        "user",
      );
      quill.insertText(start + 1, " ", "user");
      quill.setSelection(start + 2, 0, "user");
      close();
    },
    [quill, close],
  );

  useEffect(() => {
    if (!quill) {
      return;
    }
    const handleChange = () => refresh();
    quill.on("text-change", handleChange);
    quill.on("selection-change", handleChange);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (triggerStartRef.current === null) {
        return;
      }
      if (!popupOpenRef.current) {
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "Enter"
      ) {
        const handled = listRef.current?.onKeyDown({ event }) ?? false;
        if (handled) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    };
    quill.root.addEventListener("keydown", handleKeyDown, true);

    return () => {
      quill.off("text-change", handleChange);
      quill.off("selection-change", handleChange);
      quill.root.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [quill, refresh, close]);

  return { popup, listRef, select, close };
}
