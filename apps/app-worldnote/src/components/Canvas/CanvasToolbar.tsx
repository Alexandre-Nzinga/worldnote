import {
  CARD_CLASS_BY_TYPE,
  CARD_CLASS_LABELS,
  CARD_CLASS_ORDER,
  CARD_TYPE_LABELS,
  type CardClass,
} from "@worldnote/shared";
import {
  AnimatedPopover,
  MaterialSymbol,
  MotionPressable,
  WorldNoteLogo,
} from "@worldnote/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NewCardType } from "../../services/crudWorldCard/cardTemplates.js";
import { DockTabs, type DockTabItem } from "../ui/DockTabs.js";

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

const createSearchInputClassName =
  "w-full rounded-xl border border-wn-mono-700 bg-wn-mono-950 px-3 py-2 text-sm text-wn-mono-50 placeholder:text-wn-mono-500 outline-none transition-colors hover:border-wn-mono-600 focus:border-wn-mono-500";

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
  onImageTool?: () => void;
  imageToolDisabled?: boolean;
  onOpenVault?: () => void;
  onToggleAllCardViews?: () => void;
  onToggleWizard?: () => void;
  isWizardOpen?: boolean;
};

export function CanvasToolbar({
  className,
  activeTool = "select",
  onCreate,
  onImageTool,
  imageToolDisabled = false,
  onOpenVault,
  onToggleAllCardViews,
  onToggleWizard,
  isWizardOpen = false,
}: CanvasToolbarProps) {
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [createQuery, setCreateQuery] = useState("");
  const createMenuRef = useRef<HTMLDivElement>(null);
  const createSearchRef = useRef<HTMLInputElement>(null);

  const supportsCreate = useMemo(() => !!onCreate, [onCreate]);
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

  const dockItems = useMemo<DockTabItem[]>(
    () => [
      {
        id: "select",
        name: "Select",
        icon: "near_me",
        iconClassName: "-scale-x-100",
        colorClassName:
          activeTool === "select"
            ? "bg-wn-mono-50 text-wn-mono-950"
            : "bg-wn-mono-800 text-wn-mono-50",
        isActive: activeTool === "select",
      },
      {
        id: "text",
        name: "Text",
        icon: "title",
        colorClassName: "bg-wn-mono-800 text-wn-mono-50",
        disabled: true,
      },
      {
        id: "image",
        name: "Image tool",
        icon: "image",
        colorClassName:
          activeTool === "image"
            ? "bg-wn-mono-50 text-wn-mono-950"
            : "bg-wn-mono-800 text-wn-mono-50",
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
          ? "bg-wn-mono-50 text-wn-mono-950"
          : "bg-wn-mono-800 text-wn-mono-50",
        isActive: isWizardOpen,
        disabled: !onToggleWizard,
        onPress: onToggleWizard,
      },
      {
        id: "vault",
        name: "Vault",
        icon: "layers",
        colorClassName: "bg-wn-mono-800 text-wn-mono-50",
        disabled: !supportsVault,
        onPress: onOpenVault,
      },
      {
        id: "toggle-views",
        name: "Toggle card view",
        icon: "view_quilt",
        colorClassName: "bg-wn-mono-800 text-wn-mono-50",
        disabled: !supportsBulkViewToggle,
        onPress: onToggleAllCardViews,
      },
      {
        id: "create",
        name: "Create card",
        icon: "add",
        colorClassName: "bg-wn-mono-800 text-wn-mono-50",
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
      onImageTool,
      onOpenVault,
      onToggleAllCardViews,
      onToggleWizard,
      supportsBulkViewToggle,
      supportsCreate,
      supportsImageTool,
      supportsVault,
    ],
  );

  return (
    <footer
      className={`pointer-events-none absolute inset-x-0 bottom-4 z-20 flex flex-col items-center gap-3 px-4 ${className ?? ""}`}
    >
      <div
        ref={createMenuRef}
        className="pointer-events-auto relative flex justify-center"
      >
        <DockTabs items={dockItems} />

        <AnimatedPopover
          isOpen={createMenuOpen}
          className="scrollbar-wn absolute bottom-full left-1/2 z-50 mb-3 max-h-[60vh] w-136 max-w-[calc(100vw-2rem)] -translate-x-1/2 overflow-y-auto rounded-xl border border-wn-mono-700 bg-wn-mono-900 p-3 shadow-lg"
        >
          <div className="mb-3 space-y-2">
            <div className="px-1 text-[11px] font-semibold uppercase tracking-wide text-wn-mono-500">
              Create card
            </div>
            <input
              ref={createSearchRef}
              type="search"
              aria-label="Search card types"
              placeholder="Search card types…"
              value={createQuery}
              onChange={(event) => setCreateQuery(event.target.value)}
              className={createSearchInputClassName}
            />
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
            <p className="px-1 py-4 text-center text-sm text-wn-mono-500">
              No matching cards
            </p>
          )}
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
    <div className="min-w-0">
      <div className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-wn-mono-500">
        {CARD_CLASS_LABELS[cardClass]}
      </div>
      <div className="flex flex-col gap-0.5">
        {types.map((type) => (
          <MotionPressable
            key={type}
            className="flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left text-wn-mono-200 hover:border-wn-mono-700 hover:bg-wn-mono-800"
            onClick={() => onSelect(type)}
          >
            <span className="shrink-0 text-wn-mono-400">
              <MaterialSymbol
                name={createMenuIcons[type]}
                className="text-[16px]"
              />
            </span>
            <span className="truncate text-[12px] font-medium text-wn-mono-100">
              {CARD_TYPE_LABELS[type]}
            </span>
          </MotionPressable>
        ))}
      </div>
    </div>
  );
}
