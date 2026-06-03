import {
  CANVAS_CARD_DROP_EVENT,
  type CanvasCardDropDetail,
} from "@worldnote/canvas";
import { useEffect } from "react";

/** Handles pointer-drag drops from canvas card grips into the WorldWizard. */
export function useWizardCardDropListener(
  onAddCard: (cardId: string) => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onCanvasCardDrop = (event: Event) => {
      const detail = (event as CustomEvent<CanvasCardDropDetail>).detail;
      if (detail?.cardId) {
        onAddCard(detail.cardId);
      }
    };

    window.addEventListener(CANVAS_CARD_DROP_EVENT, onCanvasCardDrop);
    return () => {
      window.removeEventListener(CANVAS_CARD_DROP_EVENT, onCanvasCardDrop);
    };
  }, [enabled, onAddCard]);
}
