import { useReactFlow } from "@xyflow/react";
import { useCallback, useEffect, type MutableRefObject } from "react";
import type {
  CanvasFlowPointer,
  ResolveCanvasSpawnPosition,
} from "../../../services/canvas/canvasSpawnPosition.js";

export type CanvasPointerApi = {
  resolveSpawnPosition: ResolveCanvasSpawnPosition;
  clientToFlowPosition: (client: CanvasFlowPointer) => CanvasFlowPointer;
};

type UseCanvasPointerTrackingOptions = {
  lastPointerRef: MutableRefObject<CanvasFlowPointer | null>;
  pointerApiRef: MutableRefObject<CanvasPointerApi | null>;
};

/** Tracks pointer on the pane and exposes flow-coordinate spawn helpers. */
export function useCanvasPointerTracking({
  lastPointerRef,
  pointerApiRef,
}: UseCanvasPointerTrackingOptions) {
  const { screenToFlowPosition } = useReactFlow();

  const clientToFlowPosition = useCallback(
    (client: CanvasFlowPointer) => screenToFlowPosition(client),
    [screenToFlowPosition],
  );

  const viewportCenterFlow = useCallback((): CanvasFlowPointer => {
    const pane = document.querySelector(".react-flow__pane");
    if (pane) {
      const rect = pane.getBoundingClientRect();
      return screenToFlowPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
    return screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
  }, [screenToFlowPosition]);

  useEffect(() => {
    const resolveSpawnPosition: ResolveCanvasSpawnPosition = (options) => {
      const base = options?.explicit
        ? options.explicit
        : options?.preferViewportCenter
          ? viewportCenterFlow()
          : (lastPointerRef.current ?? viewportCenterFlow());
      const offset = options?.anchorOffset ?? { x: 0, y: 0 };
      return {
        x: base.x - offset.x,
        y: base.y - offset.y,
      };
    };

    pointerApiRef.current = {
      resolveSpawnPosition,
      clientToFlowPosition,
    };
    return () => {
      pointerApiRef.current = null;
    };
  }, [
    clientToFlowPosition,
    lastPointerRef,
    pointerApiRef,
    viewportCenterFlow,
  ]);

  useEffect(() => {
    const pane = document.querySelector<HTMLElement>(".react-flow__pane");
    if (!pane) {
      return;
    }

    const onMouseMove = (event: MouseEvent) => {
      lastPointerRef.current = clientToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    pane.addEventListener("mousemove", onMouseMove);
    return () => pane.removeEventListener("mousemove", onMouseMove);
  }, [clientToFlowPosition, lastPointerRef]);
}
