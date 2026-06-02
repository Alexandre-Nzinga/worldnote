import { useReactFlow } from "@xyflow/react";
import { useEffect, type MutableRefObject } from "react";

type CanvasFocusBridgeProps = {
  focusCardRef: MutableRefObject<((cardId: string) => void) | undefined>;
};

/** Registers canvas pan/zoom to a card; must render inside ReactFlowProvider. */
export function CanvasFocusBridge({ focusCardRef }: CanvasFocusBridgeProps) {
  const { getNode, setCenter } = useReactFlow();

  useEffect(() => {
    focusCardRef.current = (cardId: string) => {
      const node = getNode(cardId);
      if (!node) {
        return;
      }
      const height = node.measured?.height ?? 180;
      const centerY = node.position.y + height / 2;
      void setCenter(node.position.x, centerY, { zoom: 1, duration: 400 });
    };
    return () => {
      focusCardRef.current = undefined;
    };
  }, [focusCardRef, getNode, setCenter]);

  return null;
}
