import { CARD_TYPE_LABELS } from "@worldnote/shared";
import { AnimatedPopover, MotionPressable } from "@worldnote/ui";
import { useEffect, useMemo, useRef, useState } from "react";
import type { NewCardType } from "../../services/crudWorldCard/cardTemplates.js";
import { RemixIcon } from "./RemixIcon.js";

export type CreateOption = NewCardType;
export type CanvasTool = "select" | "link" | "text" | "actions";

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
  character: "ri-user-line",
  location: "ri-map-pin-line",
  item: "ri-gift-line",
  vehicle: "ri-car-line",
  flora: "ri-plant-line",
  fauna: "ri-bear-smile-line",
  building: "ri-building-line",
  structure: "ri-ancient-gate-line",
  species: "ri-bug-line",
};

type CanvasToolbarProps = {
  className?: string;
  onCreate?: (type: CreateOption) => void;
  onOpenVault?: () => void;
  onToggleAllCardViews?: () => void;
};

const primaryTools: {
  id: CanvasTool;
  label: string;
  icon: string;
}[] = [
  { id: "select", label: "Select", icon: "ri-cursor-line" },
  { id: "link", label: "Link", icon: "ri-link" },
  { id: "text", label: "Text", icon: "ri-text" },
  { id: "actions", label: "Actions", icon: "ri-function-add-line" },
];

type ToolbarButtonProps = {
  label: string;
  isActive?: boolean;
  isDisabled?: boolean;
  emphasis?: boolean;
  onPress?: () => void;
  icon: string;
};

function ToolbarButton({
  label,
  isActive = false,
  isDisabled = false,
  emphasis = false,
  onPress,
  icon,
}: ToolbarButtonProps) {
  return (
    <MotionPressable
      aria-label={label}
      aria-pressed={isActive}
      disabled={isDisabled}
      onClick={onPress}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
        emphasis
          ? "bg-wn-mono-600 text-wn-mono-950 hover:bg-wn-mono-500 disabled:opacity-40"
          : isActive
            ? "bg-wn-mono-700 text-wn-mono-50"
            : "text-wn-mono-300 hover:bg-wn-mono-800 hover:text-wn-mono-50 disabled:opacity-40"
      }`}
    >
      <RemixIcon name={icon} />
    </MotionPressable>
  );
}

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

  const handleToolPress = (tool: CanvasTool) => {
    if (tool === "select" || tool === "link") {
      setActiveTool(tool);
      setLinkHintVisible(tool === "link");
      return;
    }
  };

  const handleSelectCreateOption = (option: CreateOption) => {
    setCreateMenuOpen(false);
    onCreate?.(option);
  };

  return (
    <footer
      className={`pointer-events-none absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-2 px-4 ${className ?? ""}`}
    >
      {linkHintVisible ? (
        <p className="pointer-events-auto w-max max-w-[min(90vw,20rem)] rounded-xl border border-wn-mono-700 bg-wn-mono-900 px-3 py-2 text-center text-xs text-wn-mono-300 shadow-lg">
          Show sockets on a card in the editor, then drag from a card&apos;s
          right output into a socket on the left.
        </p>
      ) : null}

      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-wn-mono-800 bg-wn-mono-900 p-1.5 shadow-lg">
        <div className="flex items-center gap-0.5">
          {primaryTools.map((item) => {
            const isActive = activeTool === item.id;
            const isImplemented = item.id === "select" || item.id === "link";
            return (
              <ToolbarButton
                key={item.id}
                label={item.label}
                icon={item.icon}
                isActive={isActive}
                isDisabled={!isImplemented}
                onPress={() => handleToolPress(item.id)}
              />
            );
          })}
        </div>

        <ToolbarButton
          label="Vault"
          icon="ri-stack-line"
          isDisabled={!supportsVault}
          onPress={onOpenVault}
        />

        <ToolbarButton
          label="Toggle all card views"
          icon="ri-layout-masonry-line"
          isDisabled={!supportsBulkViewToggle}
          onPress={onToggleAllCardViews}
        />

        <div ref={createMenuRef} className="relative flex items-center gap-0.5">
          <ToolbarButton
            label="Create card"
            icon="ri-add-line"
            emphasis
            isDisabled={!supportsCreate}
            onPress={() => setCreateMenuOpen((open) => !open)}
          />

          <AnimatedPopover
            isOpen={createMenuOpen}
            className="absolute bottom-full right-0 z-50 mb-2 max-h-80 w-64 overflow-y-auto rounded-xl border border-wn-mono-700 bg-wn-mono-900 p-2 shadow-lg"
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
                  <RemixIcon
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
      </div>
    </footer>
  );
}
