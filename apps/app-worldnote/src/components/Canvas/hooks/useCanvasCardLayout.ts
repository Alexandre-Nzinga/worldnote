import type { CanvasFlowNode } from "@worldnote/canvas";
import {
  applyNodeChanges,
  useReactFlow,
  type NodeChange,
} from "@xyflow/react";
import { useCallback } from "react";
import {
  applyCanvasLayoutAction,
  flowNodeLayoutInputFromNode,
  type CanvasLayoutAction,
} from "../../../services/canvas/canvasLayout.js";

type CardPositionUpdater = (placement: {
  cardId: string;
  x: number;
  y: number;
}) => void;

type UseCanvasCardLayoutOptions = {
  setNodes: React.Dispatch<React.SetStateAction<CanvasFlowNode[]>>;
  pushCanvasHistory: () => void;
  updateCardPosition: CardPositionUpdater | null;
};

export function useCanvasCardLayout({
  setNodes,
  pushCanvasHistory,
  updateCardPosition,
}: UseCanvasCardLayoutOptions) {
  const { getNode } = useReactFlow();

  const applyCardLayout = useCallback(
    (action: CanvasLayoutAction, cardIds: string[]) => {
      if (!updateCardPosition || cardIds.length === 0) {
        return;
      }

      const layoutInputs = cardIds.flatMap((cardId) => {
        const node = getNode(cardId);
        if (!node || node.type !== "worldnoteCard") {
          return [];
        }
        const measuredWidth = node.measured?.width;
        const measuredHeight = node.measured?.height;
        return [
          flowNodeLayoutInputFromNode({
            id: node.id,
            position: node.position,
            measured: {
              width:
                measuredWidth && measuredWidth > 0 ? measuredWidth : undefined,
              height:
                measuredHeight && measuredHeight > 0
                  ? measuredHeight
                  : undefined,
            },
          }),
        ];
      });

      if (layoutInputs.length === 0) {
        return;
      }

      const updates = applyCanvasLayoutAction(layoutInputs, action, [0.5, 0]);
      const changes: NodeChange<CanvasFlowNode>[] = [];

      for (const [id, position] of updates) {
        const node = getNode(id);
        if (!node) {
          continue;
        }
        if (
          node.position.x === position.x &&
          node.position.y === position.y
        ) {
          continue;
        }
        changes.push({
          id,
          type: "position",
          position,
          dragging: false,
        });
      }

      if (changes.length === 0) {
        return;
      }

      pushCanvasHistory();
      setNodes((prev) => applyNodeChanges(changes, prev));

      for (const change of changes) {
        if (change.type !== "position" || !change.position) {
          continue;
        }
        void updateCardPosition({
          cardId: change.id,
          x: change.position.x,
          y: change.position.y,
        });
      }
    },
    [getNode, pushCanvasHistory, setNodes, updateCardPosition],
  );

  return applyCardLayout;
}
