import { useReactFlow, useStore, ViewportPortal } from "@xyflow/react";
import { ActionMenu, Button, MaterialSymbol } from "@worldnote/ui";
import { useCallback, useMemo, useState, type Key } from "react";

const TOOLBAR_GAP_PX = 6;

export type BulkSelectionKind = "card" | "image";

type BulkSelectionToolbarProps = {
  selectedIds: string[];
  selectionKind: BulkSelectionKind;
  onDuplicate: () => Promise<void>;
  onDelete: () => Promise<void>;
  onCreateGroup?: () => Promise<void>;
};

function countLabel(count: number): string {
  return count === 1 ? "1 selected" : `${count} selected`;
}

function deleteConfirmMessage(kind: BulkSelectionKind, count: number): string {
  if (count === 1) {
    return kind === "image" ? "Delete this image?" : "Delete this card?";
  }
  const noun = kind === "image" ? "images" : "cards";
  return `Delete ${count} selected ${noun}?`;
}

export function BulkSelectionToolbar({
  selectedIds,
  selectionKind,
  onDuplicate,
  onDelete,
  onCreateGroup,
}: BulkSelectionToolbarProps) {
  const [isBusy, setIsBusy] = useState(false);
  const { getNodesBounds } = useReactFlow();
  const transform = useStore((state) => state.transform);

  const nodeType =
    selectionKind === "image" ? "worldnoteImage" : "worldnoteCard";

  const selectedNodes = useStore(
    useCallback(
      (state) =>
        state.nodes.filter(
          (node) =>
            node.selected &&
            node.type === nodeType &&
            selectedIds.includes(node.id),
        ),
      [nodeType, selectedIds],
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
      if (key === "create-group") {
        if (!onCreateGroup) {
          return;
        }
        setIsBusy(true);
        try {
          await onCreateGroup();
        } finally {
          setIsBusy(false);
        }
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
        if (!window.confirm(deleteConfirmMessage(selectionKind, selectedIds.length))) {
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
    [isBusy, onCreateGroup, onDelete, onDuplicate, selectedIds.length, selectionKind],
  );

  if (!anchor || selectedIds.length < 2) {
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
            ...(selectionKind === "card" && onCreateGroup
              ? [
                  {
                    id: "create-group",
                    label: "Create group",
                    icon: (
                      <MaterialSymbol name="groups" className="text-base" />
                    ),
                  },
                ]
              : []),
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
              variant="secondary"
              size="sm"
              isDisabled={isBusy}
              className="h-8 min-h-0 gap-1.5 px-3 text-sm font-medium text-wn-mono-50 shadow-lg"
            >
              {countLabel(selectedIds.length)}
              <MaterialSymbol
                name="expand_more"
                className="text-base text-wn-mono-50"
              />
            </Button>
          }
        />
      </div>
    </ViewportPortal>
  );
}
