import { ActionMenu, Button, MaterialSymbol } from "@worldnote/ui";
import { useCallback, useState, type Key } from "react";
import { useCanvasCardLayout } from "../hooks/useCanvasCardLayout.js";
import {
  type CanvasAlignAction,
  type CanvasDistributeAction,
} from "../../../services/canvas/canvasLayout.js";
import type { CanvasFlowNode } from "@worldnote/canvas";

const toolbarSurfaceClassName =
  "flex items-center gap-1 rounded-xl border border-wn-mono-600 bg-wn-mono-900 px-1.5 py-1 shadow-lg";

const layoutIconButtonClassName =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-wn-text-muted transition-colors hover:bg-wn-mono-800 hover:text-wn-text disabled:opacity-50";

export type BulkSelectionKind = "card" | "image";

type BulkSelectionToolbarProps = {
  selectedIds: string[];
  selectionKind: BulkSelectionKind;
  onDuplicate: () => Promise<void>;
  onDelete: () => Promise<void>;
  onCreateGroup?: () => Promise<void>;
  onOpenWizard?: () => void;
  setNodes: React.Dispatch<React.SetStateAction<CanvasFlowNode[]>>;
  pushCanvasHistory: () => void;
  updateCardPosition: ((placement: {
    cardId: string;
    x: number;
    y: number;
  }) => void) | null;
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

const alignItems: Array<{
  id: CanvasAlignAction;
  label: string;
  icon: string;
}> = [
  { id: "align-left", label: "Align left", icon: "align_horizontal_left" },
  {
    id: "align-center-h",
    label: "Align center",
    icon: "align_horizontal_center",
  },
  { id: "align-right", label: "Align right", icon: "align_horizontal_right" },
  { id: "align-top", label: "Align top", icon: "align_vertical_top" },
  {
    id: "align-center-v",
    label: "Align middle",
    icon: "align_vertical_center",
  },
  { id: "align-bottom", label: "Align bottom", icon: "align_vertical_bottom" },
];

const distributeItems: Array<{
  id: CanvasDistributeAction;
  label: string;
  icon: string;
}> = [
  {
    id: "distribute-h",
    label: "Distribute horizontally",
    icon: "horizontal_distribute",
  },
  {
    id: "distribute-v",
    label: "Distribute vertically",
    icon: "vertical_distribute",
  },
];

function isAlignAction(key: Key): key is CanvasAlignAction {
  return alignItems.some((item) => item.id === key);
}

function isDistributeAction(key: Key): key is CanvasDistributeAction {
  return distributeItems.some((item) => item.id === key);
}

export function BulkSelectionToolbar({
  selectedIds,
  selectionKind,
  onDuplicate,
  onDelete,
  onCreateGroup,
  onOpenWizard,
  setNodes,
  pushCanvasHistory,
  updateCardPosition,
}: BulkSelectionToolbarProps) {
  const [isBusy, setIsBusy] = useState(false);
  const applyCardLayout = useCanvasCardLayout({
    setNodes,
    pushCanvasHistory,
    updateCardPosition,
  });

  const showLayoutTools =
    selectionKind === "card" &&
    Boolean(updateCardPosition) &&
    selectedIds.length > 0;
  const showBulkActions = selectedIds.length > 1;

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
      if (key === "wizard") {
        onOpenWizard?.();
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
    [isBusy, onCreateGroup, onDelete, onDuplicate, onOpenWizard, selectedIds.length, selectionKind],
  );

  const handleAlign = useCallback(
    (key: Key) => {
      if (!isAlignAction(key)) {
        return;
      }
      applyCardLayout({ type: "align", alignment: key }, selectedIds);
    },
    [applyCardLayout, selectedIds],
  );

  const handleDistribute = useCallback(
    (key: Key) => {
      if (!isDistributeAction(key)) {
        return;
      }
      applyCardLayout({ type: "distribute", axis: key }, selectedIds);
    },
    [applyCardLayout, selectedIds],
  );

  if (!showLayoutTools && !showBulkActions) {
    return null;
  }

  const canAlign = selectedIds.length > 1;
  const canDistribute = selectedIds.length > 2;

  return (
    <div
      className={toolbarSurfaceClassName}
      role="toolbar"
      aria-label="Selection tools"
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
          {showLayoutTools ? (
            <>
              <button
                type="button"
                aria-label="Snap to grid"
                title="Snap to grid"
                className={layoutIconButtonClassName}
                onClick={(event) => {
                  event.stopPropagation();
                  applyCardLayout({ type: "snap-to-grid" }, selectedIds);
                }}
              >
                <MaterialSymbol name="grid_on" className="text-[18px]" />
              </button>
              {canAlign ? (
                <ActionMenu
                  ariaLabel="Align selection"
                  placement="top-start"
                  onAction={handleAlign}
                  items={alignItems.map((item) => ({
                    id: item.id,
                    label: item.label,
                    icon: (
                      <MaterialSymbol name={item.icon} className="text-base" />
                    ),
                  }))}
                  trigger={
                    <button
                      type="button"
                      aria-label="Align"
                      title="Align"
                      className={layoutIconButtonClassName}
                    >
                      <MaterialSymbol
                        name="align_horizontal_left"
                        className="text-[18px]"
                      />
                    </button>
                  }
                />
              ) : null}
              {canDistribute ? (
                <ActionMenu
                  ariaLabel="Distribute selection"
                  placement="top-start"
                  onAction={handleDistribute}
                  items={distributeItems.map((item) => ({
                    id: item.id,
                    label: item.label,
                    icon: (
                      <MaterialSymbol name={item.icon} className="text-base" />
                    ),
                  }))}
                  trigger={
                    <button
                      type="button"
                      aria-label="Distribute"
                      title="Distribute"
                      className={layoutIconButtonClassName}
                    >
                      <MaterialSymbol
                        name="horizontal_distribute"
                        className="text-[18px]"
                      />
                    </button>
                  }
                />
              ) : null}
            </>
          ) : null}
          {showBulkActions ? (
            <ActionMenu
              ariaLabel="Selection actions"
              placement="top-start"
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
                ...(selectionKind === "card" && onOpenWizard
                  ? [
                      {
                        id: "wizard",
                        label: "WorldWizard",
                        icon: (
                          <MaterialSymbol
                            name="auto_awesome"
                            className="text-base"
                          />
                        ),
                      },
                    ]
                  : []),
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
                  className="h-8 min-h-0 gap-1.5 px-3 text-sm font-medium text-wn-mono-50 shadow-none"
                >
                  {countLabel(selectedIds.length)}
                  <MaterialSymbol
                    name="expand_more"
                    className="text-base text-wn-mono-50"
                  />
                </Button>
              }
            />
          ) : null}
    </div>
  );
}
