import { useReactFlow } from "@xyflow/react";
import { useEffect, useRef } from "react";

type CanvasFitViewBridgeProps = {
  vaultPath: string | null;
  /** Card + image nodes that should be included in the initial framing. */
  nodeCount: number;
};

/** Frames the canvas once per world after nodes load (initial fitView runs too early). */
export function CanvasFitViewBridge({
  vaultPath,
  nodeCount,
}: CanvasFitViewBridgeProps) {
  const { fitView } = useReactFlow();
  const lastVaultRef = useRef<string | null>(null);
  const lastNodeCountRef = useRef(0);
  const hasFittedRef = useRef(false);

  useEffect(() => {
    if (vaultPath !== lastVaultRef.current) {
      lastVaultRef.current = vaultPath;
      hasFittedRef.current = false;
      lastNodeCountRef.current = 0;
    }
  }, [vaultPath]);

  useEffect(() => {
    if (!vaultPath || nodeCount === 0) {
      lastNodeCountRef.current = nodeCount;
      return;
    }

    const nodesJustLoaded = lastNodeCountRef.current === 0 && nodeCount > 0;
    lastNodeCountRef.current = nodeCount;

    if (hasFittedRef.current && !nodesJustLoaded) {
      return;
    }

    let innerFrameId = 0;
    const outerFrameId = requestAnimationFrame(() => {
      innerFrameId = requestAnimationFrame(() => {
        void fitView({
          padding: 0.18,
          maxZoom: 1,
          duration: 200,
        });
        hasFittedRef.current = true;
      });
    });

    return () => {
      cancelAnimationFrame(outerFrameId);
      cancelAnimationFrame(innerFrameId);
    };
  }, [fitView, nodeCount, vaultPath]);

  return null;
}
