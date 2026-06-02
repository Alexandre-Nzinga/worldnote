import { useReactFlow, useStore, ViewportPortal } from "@xyflow/react";
import { ActionMenu, Button, MaterialSymbol } from "@worldnote/ui";
import { useCallback, useMemo, useState, type Key } from "react";

const TOOLBAR_GAP_PX = 6;

type BulkSelectionToolbarProps = {
  selectedCardIds: string[];
  onDuplicate: () => Promise<void>;
  onDelete: () => Promise<void>;
};

function countLabel(count: number): string {
  return count === 1 ? "1 selected" : `${count} selected`;
}

export function BulkSelectionToolbar({
  selectedCardIds,
  onDuplicate,
  onDelete,
}: BulkSelectionToolbarProps) {
  const [isBusy, setIsBusy] = useState(false);
  const { getNodesBounds } = useReactFlow();
  const transform = useStore((state) => state.transform);

  const selectedNodes = useStore(
    useCallback(
      (state) =>
        state.nodes.filter(
          (node) => node.selected && selectedCardIds.includes(node.id),
        ),
      [selectedCardIds],
    ),
  );

  const anchor = useMemo(() => {
    void transform;
    if (selectedNodes.length < 2) {
      return null;
    }

    const bounds = getNodesBounds(selectedNodes);
    if (!bounds.width && !bounds.height) {
      return null;
    }

    return {
      left: bounds.x + bounds.width + TOOLBAR_GAP_PX,
      top: bounds.y,
    };
  }, [getNodesBounds, selectedNodes, transform]);

  const handleAction = useCallback(
    async (key: Key) => {
      if (isBusy) {
        return;
      }
      if (key === "duplicate") {
        setIsBusy(true);
        try {
          await onDuplicate();
        } finally {
          setIsBusy(false);
        }
        return;
      }
      if (key === "delete") {
        if (
          !window.confirm(
            selectedCardIds.length === 1
              ? "Delete this card?"
              : `Delete ${selectedCardIds.length} selected cards?`,
          )
        ) {
          return;
        }
        setIsBusy(true);
        try {
          await onDelete();
        } finally {
          setIsBusy(false);
        }
      }
    },
    [isBusy, onDelete, onDuplicate, selectedCardIds.length],
  );

  if (!anchor || selectedCardIds.length < 2) {
    return null;
  }

  return (
    <ViewportPortal>
      <div
        className="pointer-events-auto absolute z-50"
        style={{ left: anchor.left, top: anchor.top }}
      >
        <ActionMenu
          ariaLabel="Selection actions"
          placement="bottom-start"
          onAction={(key) => {
            void handleAction(key);
          }}
          items={[
            {
              id: "duplicate",
              label: "Duplicate",
              icon: (
                <MaterialSymbol name="content_copy" className="text-base" />
              ),
            },
            {
              id: "delete",
              label: "Delete",
              variant: "danger",
              icon: <MaterialSymbol name="delete" className="text-base" />,
            },
          ]}
          trigger={
            <Button
              variant="white"
              size="sm"
              isDisabled={isBusy}
              className="h-8 gap-1.5 rounded-full border border-wn-mono-600 bg-wn-mono-800 px-3 text-sm font-medium text-wn-mono-50 shadow-lg"
            >
              {countLabel(selectedCardIds.length)}
              <MaterialSymbol name="expand_more" className="text-base" />
            </Button>
          }
        />
      </div>
    </ViewportPortal>
  );
}
