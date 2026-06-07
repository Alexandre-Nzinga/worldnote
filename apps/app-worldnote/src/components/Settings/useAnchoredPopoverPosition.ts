import { useCallback, useEffect, useState, type RefObject } from "react";

export type AnchoredPopoverPosition = {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
};

export function useAnchoredPopoverPosition(
  anchorRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  estimatedHeight = 260,
) {
  const [position, setPosition] = useState<AnchoredPopoverPosition | null>(
    null,
  );

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) {
      return;
    }
    const rect = anchor.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openAbove =
      spaceBelow < estimatedHeight && rect.top > estimatedHeight;

    if (openAbove) {
      setPosition({
        bottom: window.innerHeight - rect.top + 8,
        left: rect.left,
        width: rect.width,
      });
      return;
    }

    setPosition({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }, [anchorRef, estimatedHeight]);

  useEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  return position;
}
