import type { Node, NodeProps } from "@xyflow/react";
import { NodeResizer, useInternalNode } from "@xyflow/react";
import { motion } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";
import { useCanvasImageInteraction } from "./CanvasImageInteractionContext.js";
import { CardImageView } from "./CardImageView.js";
import {
  CANVAS_IMAGE_MAX_HEIGHT,
  CANVAS_IMAGE_MAX_WIDTH,
  CANVAS_IMAGE_MIN_HEIGHT,
  CANVAS_IMAGE_MIN_WIDTH,
  canvasImageNodeStyleForNaturalSize,
} from "./canvas-image-sizing.js";

export type ImageNodeData = {
  imageSrc: string;
  imagePath: string;
  enterAnimation?: boolean;
};

export type ImageFlowNode = Node<ImageNodeData, "worldnoteImage">;

const ASPECT_RATIO_TOLERANCE = 0.04;

function ImageNodeInner({
  id,
  data,
  selected = false,
  width,
  height,
}: NodeProps<ImageFlowNode>) {
  const { onResizeEnd } = useCanvasImageInteraction();
  const internalNode = useInternalNode<ImageFlowNode>(id);
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const syncedAspectRef = useRef(false);

  useEffect(() => {
    syncedAspectRef.current = false;
    setNaturalSize(null);
    if (!data.imageSrc) {
      return;
    }
    const probe = new Image();
    probe.onload = () => {
      if (probe.naturalWidth > 0 && probe.naturalHeight > 0) {
        setNaturalSize({
          width: probe.naturalWidth,
          height: probe.naturalHeight,
        });
      }
    };
    probe.src = data.imageSrc;
  }, [data.imageSrc]);

  const nodeWidth =
    width ??
    (typeof internalNode?.style?.width === "number"
      ? internalNode.style.width
      : internalNode?.measured?.width);
  const nodeHeight =
    height ??
    (typeof internalNode?.style?.height === "number"
      ? internalNode.style.height
      : internalNode?.measured?.height);

  useEffect(() => {
    if (
      naturalSize == null ||
      syncedAspectRef.current ||
      nodeWidth == null ||
      nodeHeight == null ||
      nodeHeight <= 0
    ) {
      return;
    }
    const naturalAspect = naturalSize.width / naturalSize.height;
    const currentAspect = nodeWidth / nodeHeight;
    if (Math.abs(currentAspect - naturalAspect) <= ASPECT_RATIO_TOLERANCE) {
      syncedAspectRef.current = true;
      return;
    }
    const next = canvasImageNodeStyleForNaturalSize(
      naturalSize.width,
      naturalSize.height,
    );
    syncedAspectRef.current = true;
    onResizeEnd?.(id, next);
  }, [id, naturalSize, nodeHeight, nodeWidth, onResizeEnd]);

  return (
    <motion.div
      className={`h-full w-full overflow-hidden rounded-xl border bg-transparent shadow-lg ${
        selected
          ? "border-wn-mono-50 ring-2 ring-wn-mono-50 ring-offset-2 ring-offset-wn-mono-950"
          : "border-wn-mono-700"
      }`}
      initial={data.enterAnimation ? { opacity: 0, scale: 0.92 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={CANVAS_IMAGE_MIN_WIDTH}
        minHeight={CANVAS_IMAGE_MIN_HEIGHT}
        maxWidth={CANVAS_IMAGE_MAX_WIDTH}
        maxHeight={CANVAS_IMAGE_MAX_HEIGHT}
        keepAspectRatio
        handleClassName="!h-2.5 !w-2.5 !rounded-sm !border !border-wn-mono-50 !bg-wn-mono-800"
        lineClassName="!border-wn-mono-400"
        onResizeEnd={(_, params) => {
          onResizeEnd?.(id, {
            width: params.width,
            height: params.height,
          });
        }}
      />
      <CardImageView
        src={data.imageSrc}
        alt=""
        fit="fill"
        className="block h-full w-full"
      />
    </motion.div>
  );
}

export const ImageNode = memo(ImageNodeInner);
ImageNode.displayName = "ImageNode";
