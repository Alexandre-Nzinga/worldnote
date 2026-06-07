import {
  CARD_CLASS_BY_TYPE,
  CARD_CLASS_LABELS,
  CARD_CLASS_ORDER,
  CARD_TYPE_LABELS,
} from "@worldnote/shared";
import { MaterialSymbol } from "@worldnote/ui";
import { useEffect, useMemo, useRef } from "react";
import type { NewCardType } from "../../../services/crudWorldCard/cardTemplates.js";
import { CREATABLE_CARD_TYPES } from "../../../services/crudWorldCard/creatableCardTypes.js";

export type CanvasCardContextMenuView = "actions" | "change-type";

export type CanvasCardContextMenuState = {
  cardId: string;
  x: number;
  y: number;
  view: CanvasCardContextMenuView;
};

type CanvasCardContextMenuProps = {
  menu: CanvasCardContextMenuState | null;
  selectionCount?: number;
  currentCardType?: NewCardType;
  onClose: () => void;
  onDuplicate: (cardId: string) => void;
  onCopy: (cardId: string) => void;
  onShowChangeType: (cardId: string) => void;
  onBackToActions: () => void;
  onChangeType: (cardId: string, newType: NewCardType) => void;
  onDelete: (cardId: string) => void;
  onOpenWizard?: () => void;
  onCreateFamilyCard?: () => void;
  createFamilyCardLabel?: string;
};

const menuClassName =
  "pointer-events-auto fixed z-[100] min-w-[11rem] max-h-[min(70vh,24rem)] overflow-hidden rounded-xl border border-wn-mono-700 bg-wn-mono-800 p-1 shadow-lg";

const itemClassName =
  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-wn-mono-100 transition-colors hover:bg-wn-mono-700 hover:text-wn-mono-50";

const typeItemClassName =
  "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-left text-sm font-semibold text-wn-mono-100 transition-colors hover:bg-wn-mono-700 hover:text-wn-mono-50";

const sectionLabelClassName =
  "px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-wn-mono-500";

function clampMenuPosition(
  x: number,
  y: number,
  menuWidth: number,
  menuHeight: number,
): { x: number; y: number } {
  const margin = 8;
  const maxX = window.innerWidth - menuWidth - margin;
  const maxY = window.innerHeight - menuHeight - margin;
  return {
    x: Math.max(margin, Math.min(x, maxX)),
    y: Math.max(margin, Math.min(y, maxY)),
  };
}

export function CanvasCardContextMenu({
  menu,
  selectionCount = 1,
  currentCardType,
  onClose,
  onDuplicate,
  onCopy,
  onShowChangeType,
  onBackToActions,
  onChangeType,
  onDelete,
  onOpenWizard,
  onCreateFamilyCard,
  createFamilyCardLabel = "Create family card",
}: CanvasCardContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });

  const groupedTypes = useMemo(
    () =>
      CARD_CLASS_ORDER.map((cardClass) => ({
        cardClass,
        types: CREATABLE_CARD_TYPES.filter(
          (type) => CARD_CLASS_BY_TYPE[type] === cardClass,
        ),
      })).filter((group) => group.types.length > 0),
    [],
  );

  useEffect(() => {
    if (!menu) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (menuRef.current?.contains(target)) {
        return;
      }
      onClose();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (menu.view === "change-type") {
          onBackToActions();
          return;
        }
        onClose();
      }
    };

    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menu, onBackToActions, onClose]);

  useEffect(() => {
    if (!menu || !menuRef.current) {
      return;
    }
    const rect = menuRef.current.getBoundingClientRect();
    const clamped = clampMenuPosition(menu.x, menu.y, rect.width, rect.height);
    if (
      clamped.x !== positionRef.current.x ||
      clamped.y !== positionRef.current.y
    ) {
      positionRef.current = clamped;
      menuRef.current.style.left = `${clamped.x}px`;
      menuRef.current.style.top = `${clamped.y}px`;
    }
  }, [menu]);

  if (!menu) {
    return null;
  }

  const multi = selectionCount > 1;
  const style = { left: menu.x, top: menu.y };

  if (menu.view === "change-type") {
    return (
      <div
        ref={menuRef}
        role="menu"
        aria-label="Change card type"
        className={`${menuClassName} flex flex-col`}
        style={style}
      >
        <button
          type="button"
          className={`${itemClassName} shrink-0`}
          onClick={onBackToActions}
        >
          <MaterialSymbol name="arrow_back" className="text-base" />
          Back
        </button>
        <div className="scrollbar-wn min-h-0 flex-1 overflow-y-auto py-1">
          {groupedTypes.map((group) => (
            <div key={group.cardClass}>
              <div className={sectionLabelClassName}>
                {CARD_CLASS_LABELS[group.cardClass]}
              </div>
              {group.types.map((type) => {
                const isCurrent = type === currentCardType;
                return (
                  <button
                    key={type}
                    type="button"
                    role="menuitem"
                    disabled={isCurrent}
                    className={`${typeItemClassName} disabled:cursor-default disabled:opacity-40`}
                    onClick={() => {
                      onChangeType(menu.cardId, type);
                      onClose();
                    }}
                  >
                    <span>{CARD_TYPE_LABELS[type]}</span>
                    {isCurrent ? (
                      <MaterialSymbol
                        name="check"
                        className="text-base text-wn-mono-400"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Card actions"
      className={menuClassName}
      style={style}
    >
      {multi ? (
        <div className={sectionLabelClassName}>
          {selectionCount} cards selected
        </div>
      ) : null}
      <button
        type="button"
        role="menuitem"
        className={itemClassName}
        onClick={() => {
          onDuplicate(menu.cardId);
          onClose();
        }}
      >
        <MaterialSymbol name="content_copy" className="text-base" />
        {multi ? `Duplicate (${selectionCount})` : "Duplicate"}
      </button>
      <button
        type="button"
        role="menuitem"
        className={itemClassName}
        onClick={() => {
          onCopy(menu.cardId);
          onClose();
        }}
      >
        <MaterialSymbol name="copy_all" className="text-base" />
        Copy
      </button>
      {onOpenWizard ? (
        <button
          type="button"
          role="menuitem"
          className={itemClassName}
          onClick={() => {
            onOpenWizard();
            onClose();
          }}
        >
          <MaterialSymbol name="auto_awesome" className="text-base" />
          {multi ? `WorldWizard (${selectionCount})` : "WorldWizard"}
        </button>
      ) : null}
      {onCreateFamilyCard ? (
        <button
          type="button"
          role="menuitem"
          className={itemClassName}
          onClick={() => {
            onCreateFamilyCard();
            onClose();
          }}
        >
          <MaterialSymbol name="family_restroom" className="text-base" />
          {multi
            ? `${createFamilyCardLabel} (${selectionCount})`
            : createFamilyCardLabel}
        </button>
      ) : null}
      {multi ? null : (
        <button
          type="button"
          role="menuitem"
          className={itemClassName}
          onClick={() => onShowChangeType(menu.cardId)}
        >
          <MaterialSymbol name="category" className="text-base" />
          <span className="min-w-0 flex-1">Change type</span>
          <MaterialSymbol
            name="chevron_right"
            className="text-base text-wn-mono-400"
          />
        </button>
      )}
      <button
        type="button"
        role="menuitem"
        className={`${itemClassName} text-danger hover:text-danger`}
        onClick={() => {
          onDelete(menu.cardId);
          onClose();
        }}
      >
        <MaterialSymbol name="delete" className="text-base" />
        {multi ? `Delete (${selectionCount})` : "Delete"}
      </button>
    </div>
  );
}
