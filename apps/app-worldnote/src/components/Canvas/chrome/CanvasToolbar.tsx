import {
  CARD_CLASS_BY_TYPE,
  CARD_CLASS_LABELS,
  CARD_CLASS_ORDER,
  CARD_TYPE_LABELS,
  type CardClass,
} from "@worldnote/shared";
import {
  AnimatedPopover,
  fieldLabelClassName,
  getBodyTextStyle,
  getHeadingProps,
  MaterialSymbol,
  MotionPressable,
  WorldNoteLogo,
} from "@worldnote/ui";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { NewCardType } from "../../../services/crudWorldCard/cardTemplates.js";
import {
  dockInactiveClassName,
  primaryAccentFillClassName,
} from "../../../services/settings/primaryAccentStyles.js";
import { surfacePanelClassName } from "../../shell/pageShellStyles.js";
import { DockTabs, type DockTabItem } from "../../ui/DockTabs.js";

export type CreateOption = NewCardType;
export type CanvasTool = "select" | "text" | "image" | "actions";

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
  "planet",
  "organization",
  "polity",
  "event",
  "family",
  "group",
  "star",
  "moon",
  "asteroid",
  "satellite",
  "law",
  "religion",
  "language",
  "culture",
  "spell",
  "disease",
  "disaster",
  "combat_style",
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
  planet: "public",
  organization: "corporate_fare",
  polity: "flag",
  event: "event",
  family: "family_restroom",
  group: "groups",
  star: "star",
  moon: "dark_mode",
  asteroid: "scatter_plot",
  satellite: "satellite_alt",
  law: "gavel",
  religion: "church",
  language: "translate",
  culture: "diversity_3",
  spell: "auto_fix_high",
  disease: "coronavirus",
  disaster: "storm",
  combat_style: "swords",
};

const createSearchFieldClassName = "relative flex w-full items-center";

const createSearchInputClassName =
  "w-full rounded-xl border-0 bg-wn-surface-raised py-2.5 pl-10 pr-10 text-sm text-wn-text shadow-none outline-none transition-colors placeholder:text-wn-text-subtle hover:bg-wn-mono-800 focus:bg-wn-mono-800 focus:ring-2 focus:ring-wn-mono-600";

const createColumnPanelClassName =
  "min-w-0 rounded-xl bg-wn-surface-sunken px-3 py-3";

const createOptionClassName =
  "flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-wn-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wn-mono-600";

function matchesCreateQuery(type: CreateOption, normalizedQuery: string): boolean {
  if (!normalizedQuery) {
    return true;
  }
  const label = CARD_TYPE_LABELS[type].toLowerCase();
  return (
    label.includes(normalizedQuery) ||
    type.toLowerCase().includes(normalizedQuery)
  );
}

type CanvasToolbarProps = {
  className?: string;
  activeTool?: CanvasTool;
  onCreate?: (type: CreateOption) => void;
  onTextTool?: () => void;
  textToolDisabled?: boolean;
  onImageTool?: () => void;
  imageToolDisabled?: boolean;
  onOpenVault?: () => void;
  onToggleAllCardViews?: () => void;
  onToggleWizard?: () => void;
  isWizardOpen?: boolean;
  onToggleGraphView?: () => void;
  isGraphViewOpen?: boolean;
  /** Renders above the dock (e.g. sticky note controls). */
  noteToolbar?: ReactNode;
  imageToolbar?: ReactNode;
  /** Multi-select layout and bulk actions above the dock. */
  selectionToolbar?: ReactNode;
};

export function CanvasToolbar({
  className,
  activeTool = "select",
  onCreate,
  onTextTool,
  textToolDisabled = false,
  onImageTool,
  imageToolDisabled = false,
  onOpenVault,
  onToggleAllCardViews,
  onToggleWizard,
  isWizardOpen = false,
  onToggleGraphView,
  isGraphViewOpen = false,
  noteToolbar,
  imageToolbar,
  selectionToolbar,
}: CanvasToolbarProps) {
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [createQuery, setCreateQuery] = useState("");
  const createMenuRef = useRef<HTMLDivElement>(null);
  const createSearchRef = useRef<HTMLInputElement>(null);

  const supportsCreate = useMemo(() => !!onCreate, [onCreate]);
  const supportsTextTool = useMemo(
    () => !!onTextTool && !textToolDisabled,
    [onTextTool, textToolDisabled],
  );
  const supportsImageTool = useMemo(
    () => !!onImageTool && !imageToolDisabled,
    [imageToolDisabled, onImageTool],
  );
  const supportsVault = useMemo(() => !!onOpenVault, [onOpenVault]);
  const supportsBulkViewToggle = useMemo(
    () => !!onToggleAllCardViews,
    [onToggleAllCardViews],
  );

  const closeCreateMenu = useCallback(() => {
    setCreateMenuOpen(false);
    setCreateQuery("");
  }, []);

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
        closeCreateMenu();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCreateMenu();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeCreateMenu, createMenuOpen]);

  useEffect(() => {
    if (!createMenuOpen) {
      return;
    }
    const id = requestAnimationFrame(() => {
      createSearchRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [createMenuOpen]);

  const groupedCreateOptions = useMemo(() => {
    const normalizedQuery = createQuery.trim().toLowerCase();
    return CARD_CLASS_ORDER.map((cardClass) => ({
      cardClass,
      types: creatableTypes.filter(
        (type) =>
          CARD_CLASS_BY_TYPE[type] === cardClass &&
          matchesCreateQuery(type, normalizedQuery),
      ),
    })).filter((group) => group.types.length > 0);
  }, [createQuery]);

  const hasCreateResults = groupedCreateOptions.length > 0;

  const handleSelectCreateOption = (option: CreateOption) => {
    closeCreateMenu();
    onCreate?.(option);
  };

  const dockActiveClassName = primaryAccentFillClassName;

  const dockItems = useMemo<DockTabItem[]>(
    () => [
      {
        id: "select",
        name: "Select",
        icon: "near_me",
        iconClassName: "-scale-x-100",
        colorClassName:
          activeTool === "select" ? dockActiveClassName : dockInactiveClassName,
        isActive: activeTool === "select",
      },
      {
        id: "text",
        name: "Text",
        icon: "title",
        colorClassName:
          activeTool === "text" ? dockActiveClassName : dockInactiveClassName,
        isActive: activeTool === "text",
        disabled: !supportsTextTool,
        onPress: onTextTool,
      },
      {
        id: "image",
        name: "Image tool",
        icon: "image",
        colorClassName:
          activeTool === "image" ? dockActiveClassName : dockInactiveClassName,
        isActive: activeTool === "image",
        disabled: !supportsImageTool,
        onPress: onImageTool,
      },
      {
        id: "wizard",
        name: "WorldWizard",
        iconNode: (
          <WorldNoteLogo
            variant="icon"
            format="svg"
            tone={isWizardOpen ? "black" : "white"}
            className="h-5 w-5 opacity-95"
            alt=""
          />
        ),
        colorClassName: isWizardOpen
          ? dockActiveClassName
          : dockInactiveClassName,
        isActive: isWizardOpen,
        disabled: !onToggleWizard,
        onPress: onToggleWizard,
      },
      {
        id: "graph-view",
        name: "Graph view",
        icon: "hub",
        colorClassName: isGraphViewOpen
          ? dockActiveClassName
          : dockInactiveClassName,
        isActive: isGraphViewOpen,
        disabled: !onToggleGraphView,
        onPress: onToggleGraphView,
      },
      {
        id: "vault",
        name: "Vault",
        icon: "layers",
        colorClassName: dockInactiveClassName,
        disabled: !supportsVault,
        onPress: onOpenVault,
      },
      {
        id: "toggle-views",
        name: "Toggle card view",
        icon: "view_quilt",
        colorClassName: dockInactiveClassName,
        disabled: !supportsBulkViewToggle,
        onPress: onToggleAllCardViews,
      },
      {
        id: "create",
        name: "Create card",
        icon: "add",
        colorClassName: createMenuOpen
          ? dockActiveClassName
          : dockInactiveClassName,
        isActive: createMenuOpen,
        disabled: !supportsCreate,
        onPress: () => {
          if (createMenuOpen) {
            closeCreateMenu();
          } else {
            setCreateMenuOpen(true);
          }
        },
      },
    ],
    [
      activeTool,
      closeCreateMenu,
      createMenuOpen,
      isWizardOpen,
      isGraphViewOpen,
      onImageTool,
      onTextTool,
      onOpenVault,
      supportsTextTool,
      onToggleAllCardViews,
      onToggleWizard,
      onToggleGraphView,
      supportsBulkViewToggle,
      supportsCreate,
      supportsImageTool,
      supportsVault,
    ],
  );

  return (
    <footer
      className={`pointer-events-none absolute inset-x-0 bottom-4 z-20 flex flex-col items-center gap-2 px-4 ${className ?? ""}`}
    >
      {noteToolbar || imageToolbar || selectionToolbar ? (
        <div className="pointer-events-auto flex flex-col items-center gap-2">
          {noteToolbar ? <div className="flex justify-center">{noteToolbar}</div> : null}
          {imageToolbar ? <div className="flex justify-center">{imageToolbar}</div> : null}
          {selectionToolbar ? (
            <div className="flex justify-center">{selectionToolbar}</div>
          ) : null}
        </div>
      ) : null}
      <div
        ref={createMenuRef}
        className="pointer-events-auto relative flex justify-center"
      >
        <DockTabs items={dockItems} />

        <AnimatedPopover
          isOpen={createMenuOpen}
          className={`scrollbar-wn absolute bottom-full left-1/2 z-50 mb-3 max-h-[60vh] w-136 max-w-[calc(100vw-2rem)] -translate-x-1/2 overflow-y-auto ${surfacePanelClassName} shadow-lg`}
        >
          <div className="flex flex-col gap-4">
            <h2 {...getHeadingProps("h5", { tone: "inverse" })}>Create card</h2>
            <div className={createSearchFieldClassName}>
              <MaterialSymbol
                name="search"
                className="pointer-events-none absolute left-3.5 text-[20px] text-wn-text-subtle"
                aria-hidden
              />
              <input
                ref={createSearchRef}
                type="text"
                aria-label="Search card types"
                placeholder="Search card types…"
                value={createQuery}
                onChange={(event) => setCreateQuery(event.target.value)}
                className={createSearchInputClassName}
              />
              {createQuery.length > 0 ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  className="absolute right-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-wn-surface text-wn-text-muted transition-colors hover:bg-wn-mono-800 hover:text-wn-text"
                  onClick={() => {
                    setCreateQuery("");
                    createSearchRef.current?.focus();
                  }}
                >
                  <MaterialSymbol name="close" className="text-[18px]" />
                </button>
              ) : null}
            </div>

            {hasCreateResults ? (
              <div className="grid grid-cols-3 gap-3">
                {groupedCreateOptions.map(({ cardClass, types }) => (
                  <CreateCardClassColumn
                    key={cardClass}
                    cardClass={cardClass}
                    types={types}
                    onSelect={handleSelectCreateOption}
                  />
                ))}
              </div>
            ) : (
              <p
                className="py-4 text-center"
                style={getBodyTextStyle("small")}
              >
                No matching cards
              </p>
            )}
          </div>
        </AnimatedPopover>
      </div>
    </footer>
  );
}

type CreateCardClassColumnProps = {
  cardClass: CardClass;
  types: CreateOption[];
  onSelect: (type: CreateOption) => void;
};

function CreateCardClassColumn({
  cardClass,
  types,
  onSelect,
}: CreateCardClassColumnProps) {
  return (
    <div className={createColumnPanelClassName}>
      <span className={`${fieldLabelClassName} mb-2 block`}>
        {CARD_CLASS_LABELS[cardClass]}
      </span>
      <div className="flex flex-col gap-0.5">
        {types.map((type) => (
          <MotionPressable
            key={type}
            className={createOptionClassName}
            onClick={() => onSelect(type)}
          >
            <span className="shrink-0 text-wn-text-muted">
              <MaterialSymbol
                name={createMenuIcons[type]}
                className="text-[20px]"
              />
            </span>
            <span className="truncate text-sm font-medium text-wn-text">
              {CARD_TYPE_LABELS[type]}
            </span>
          </MotionPressable>
        ))}
      </div>
    </div>
  );
}
