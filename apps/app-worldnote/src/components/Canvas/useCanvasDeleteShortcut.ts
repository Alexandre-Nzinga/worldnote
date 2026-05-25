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
  selectedCardId: string | null;
  selectedLinkId: string | null;
  onDeleteCard: (cardId: string) => Promise<void>;
  onDeleteLink: (linkId: string) => Promise<void>;
};

/** Delete / Backspace removes the selected link or card (link takes priority). */
export function useCanvasDeleteShortcut({
  selectedCardId,
  selectedLinkId,
  onDeleteCard,
  onDeleteLink,
}: UseCanvasDeleteShortcutOptions) {
  const selectedCardIdRef = useRef(selectedCardId);
  const selectedLinkIdRef = useRef(selectedLinkId);
  const onDeleteCardRef = useRef(onDeleteCard);
  const onDeleteLinkRef = useRef(onDeleteLink);

  selectedCardIdRef.current = selectedCardId;
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

      const cardId = selectedCardIdRef.current;
      if (cardId) {
        event.preventDefault();
        void onDeleteCardRef.current(cardId);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
