import { CARD_TYPE_LABELS } from "@worldnote/shared";
import { AnimatedPopover, MaterialSymbol, MotionPressable } from "@worldnote/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NewCardType } from "../../services/crudWorldCard/cardTemplates.js";
import { DockTabs, type DockTabItem } from "../ui/DockTabs.js";

export type CreateOption = NewCardType;
export type CanvasTool = "select" | "link" | "text" | "actions";

const LINK_HINT_DISMISS_MS = 6_000;

const creatableTypes: CreateOption[] = [
  "character",
  "location",
  "item",
  "vehicle",
  "flora",
  "fauna",
  "building",
  "structure",
  "species",
];

const createMenuIcons: Record<CreateOption, string> = {
  character: "person",
  location: "location_on",
  item: "redeem",
  vehicle: "directions_car",
  flora: "eco",
  fauna: "pets",
  building: "apartment",
  structure: "holiday_village",
  species: "bug_report",
};

type CanvasToolbarProps = {
  className?: string;
  onCreate?: (type: CreateOption) => void;
  onOpenVault?: () => void;
  onToggleAllCardViews?: () => void;
};

export function CanvasToolbar({
  className,
  onCreate,
  onOpenVault,
  onToggleAllCardViews,
}: CanvasToolbarProps) {
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<CanvasTool>("select");
  const [linkHintVisible, setLinkHintVisible] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);

  const supportsCreate = useMemo(() => !!onCreate, [onCreate]);
  const supportsVault = useMemo(() => !!onOpenVault, [onOpenVault]);
  const supportsBulkViewToggle = useMemo(
    () => !!onToggleAllCardViews,
    [onToggleAllCardViews],
  );

  useEffect(() => {
    if (!createMenuOpen) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        createMenuRef.current &&
        !createMenuRef.current.contains(target)
      ) {
        setCreateMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCreateMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [createMenuOpen]);

  useEffect(() => {
    if (!linkHintVisible) {
      return;
    }
    const timer = window.setTimeout(() => {
      setLinkHintVisible(false);
    }, LINK_HINT_DISMISS_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [linkHintVisible]);

  const handleToolPress = useCallback((tool: CanvasTool) => {
    if (tool === "select" || tool === "link") {
      setActiveTool(tool);
      if (tool === "link") {
        setLinkHintVisible(true);
      } else {
        setLinkHintVisible(false);
      }
    }
  }, []);

  const handleSelectCreateOption = (option: CreateOption) => {
    setCreateMenuOpen(false);
    onCreate?.(option);
  };

  const dockItems = useMemo<DockTabItem[]>(
    () => [
      {
        id: "select",
        name: "Select",
        icon: "near_me",
        colorClassName: "bg-wn-azure-500 text-wn-mono-50",
        isActive: activeTool === "select",
        onPress: () => handleToolPress("select"),
      },
      {
        id: "link",
        name: "Link",
        icon: "link",
        colorClassName: "bg-wn-indigo-500 text-wn-mono-50",
        isActive: activeTool === "link",
        onPress: () => handleToolPress("link"),
      },
      {
        id: "text",
        name: "Text",
        icon: "title",
        colorClassName: "bg-wn-mono-700 text-wn-mono-300",
        disabled: true,
      },
      {
        id: "actions",
        name: "Actions",
        icon: "widgets",
        colorClassName: "bg-wn-mono-700 text-wn-mono-300",
        disabled: true,
      },
      {
        id: "vault",
        name: "Vault",
        icon: "layers",
        colorClassName: "bg-wn-rose-500 text-wn-mono-950",
        disabled: !supportsVault,
        onPress: onOpenVault,
      },
      {
        id: "toggle-views",
        name: "Toggle all card views",
        icon: "view_quilt",
        colorClassName: "bg-wn-lime-400 text-wn-mono-950",
        disabled: !supportsBulkViewToggle,
        onPress: onToggleAllCardViews,
      },
      {
        id: "create",
        name: "Create card",
        icon: "add",
        colorClassName: "bg-wn-amber-300 text-wn-mono-950",
        isActive: createMenuOpen,
        disabled: !supportsCreate,
        onPress: () => setCreateMenuOpen((open) => !open),
      },
    ],
    [
      activeTool,
      createMenuOpen,
      onOpenVault,
      onToggleAllCardViews,
      supportsBulkViewToggle,
      supportsCreate,
      supportsVault,
      handleToolPress,
    ],
  );

  return (
    <footer
      className={`pointer-events-none absolute inset-x-0 bottom-4 z-20 flex flex-col items-center gap-3 px-4 ${className ?? ""}`}
    >
      {linkHintVisible ? (
        <p className="pointer-events-auto w-max max-w-[min(90vw,20rem)] rounded-xl border border-wn-mono-700 bg-wn-mono-900 px-3 py-2 text-center text-xs text-wn-mono-300 shadow-lg">
          Show sockets on a card in the editor, then drag from a card&apos;s
          right output into a socket on the left.
        </p>
      ) : null}

      <div
        ref={createMenuRef}
        className="pointer-events-auto relative flex justify-center"
      >
        <DockTabs items={dockItems} />

        <AnimatedPopover
          isOpen={createMenuOpen}
          className="scrollbar-wn absolute bottom-full left-1/2 z-50 mb-3 max-h-80 w-64 -translate-x-1/2 overflow-y-auto rounded-xl border border-wn-mono-700 bg-wn-mono-900 p-2 shadow-lg"
        >
          <div className="mb-2 px-2 pt-1 text-[11px] font-semibold uppercase tracking-wide text-wn-mono-500">
            Create card
          </div>
          {creatableTypes.map((type) => (
            <MotionPressable
              key={type}
              className="mb-1 flex w-full items-center gap-2 rounded-xl border border-transparent px-2 py-2 text-left text-wn-mono-200 hover:border-wn-mono-700 hover:bg-wn-mono-800"
              onClick={() => handleSelectCreateOption(type)}
            >
              <span className="text-wn-mono-400">
                <MaterialSymbol
                  name={createMenuIcons[type]}
                  className="text-[16px]"
                />
              </span>
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[12px] font-medium text-wn-mono-100">
                  {CARD_TYPE_LABELS[type]}
                </span>
                <span className="text-[10px] text-wn-mono-500">
                  Create a {CARD_TYPE_LABELS[type].toLowerCase()} card
                </span>
              </span>
            </MotionPressable>
          ))}
        </AnimatedPopover>
      </div>
    </footer>
  );
}
