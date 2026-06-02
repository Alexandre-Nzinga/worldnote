import { useEffect, useRef } from "react";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return Boolean(
    target.closest(
      'input, textarea, select, [contenteditable="true"], [contenteditable=""]',
    ),
  );
}

type UseCanvasDeleteShortcutOptions = {
  selectedCardIds: string[];
  selectedLinkId: string | null;
  onDeleteCard: (cardId: string) => Promise<void>;
  onDeleteLink: (linkId: string) => Promise<void>;
};

/** Delete / Backspace removes the selected link or all selected cards (link takes priority). */
export function useCanvasDeleteShortcut({
  selectedCardIds,
  selectedLinkId,
  onDeleteCard,
  onDeleteLink,
}: UseCanvasDeleteShortcutOptions) {
  const selectedCardIdsRef = useRef(selectedCardIds);
  const selectedLinkIdRef = useRef(selectedLinkId);
  const onDeleteCardRef = useRef(onDeleteCard);
  const onDeleteLinkRef = useRef(onDeleteLink);

  selectedCardIdsRef.current = selectedCardIds;
  selectedLinkIdRef.current = selectedLinkId;
  onDeleteCardRef.current = onDeleteCard;
  onDeleteLinkRef.current = onDeleteLink;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Delete" && event.key !== "Backspace") {
        return;
      }
      if (event.repeat || isEditableTarget(event.target)) {
        return;
      }

      const linkId = selectedLinkIdRef.current;
      if (linkId) {
        event.preventDefault();
        void onDeleteLinkRef.current(linkId);
        return;
      }

      const cardIds = selectedCardIdsRef.current;
      if (cardIds.length > 0) {
        event.preventDefault();
        for (const cardId of cardIds) {
          void onDeleteCardRef.current(cardId);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
