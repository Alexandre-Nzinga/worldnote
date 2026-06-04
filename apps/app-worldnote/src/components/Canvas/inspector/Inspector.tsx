import { Input } from "@heroui/react";
import {
  cardImageObjectStyles,
  DEFAULT_CARD_IMAGE_POSITION,
  normalizeCardImageDisplay,
  type CardImagePosition,
  listSocketsForCardType,
  type Link,
  type WorldCard,
} from "@worldnote/shared";
import { CardTypePill, visualConfigFor } from "@worldnote/canvas";
import {
  AnimatedModal,
  AnimatedPanel,
  getHeadingProps,
  MaterialSymbol,
  type StepDirection,
  stepTransition,
  stepTransitionVariants,
  usePrefersReducedMotion,
} from "@worldnote/ui";
import type { Editor } from "@tiptap/core";
import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { useResolvedTheme } from "../../../theme/ThemeProvider.js";
import { InspectorCardMoreMenu } from "./InspectorCardMoreMenu.js";
import {
  inspectorHeaderActionClassName,
  inspectorHeaderIconActionClassName,
  inspectorNameFieldClassNames,
  inspectorSubtitleFieldClassNames,
} from "./inspectorFieldStyles.js";
import { cardImageSrc } from "../../../services/canvas/cardNodeData.js";
import { cardsInGroup } from "../../../services/canvas/groupMemberCards.js";
import { openCardJsonInExternalApp } from "../../../services/desktop/openCardJson.js";
import {
  pickCardImageFile,
  saveCardImage,
  saveFamilyCrest,
} from "../../../services/desktop/saveCardImage.js";
import {
  formatSocketLinkValue,
  getSocketLinkLabels,
} from "../../../services/links/socketLinks.js";
import { formatSocketId } from "../../../services/settings/visibleSocketSettings.js";
import { CardImageEditorPreview } from "../card-editor/CardImageEditorPreview.js";
import { InspectorImageToolbar } from "./InspectorImageToolbar.js";
import {
  buildWorldCard,
  defaultTypeFields,
  typeFieldsFromCard,
  type TypeSpecificEditorState,
} from "../card-editor/cardEditorTypes.js";
import { DocumentOutline } from "./DocumentOutline.js";
import { InspectorDeleteButton } from "./InspectorDeleteButton.js";
import { InfoColumn } from "./InfoColumn.js";
import { InfoTab } from "./InfoTab.js";
import type { LoreSimpleEditorHandle } from "../../editor/LoreSimpleEditor.js";
import { InspectorTabs, type InspectorTabId } from "./InspectorTabs.js";
import { descriptionSummaryFromMarkdown } from "../../../services/canvas/stickyNoteMarkdown.js";
import { PropertiesColumn } from "./PropertiesColumn.js";
import { stripLeadingLoreHeading } from "./inspectorLoreMarkdown.js";
import { PropertiesTab } from "./PropertiesTab.js";
import { usePanelHotkeys } from "../hooks/usePanelHotkeys.js";

type PropertyRow = { key: string; value: string };

export type InspectorMode = "read" | "edit";

const inspectorSidebarClassName =
  "pointer-events-auto absolute bottom-4 right-4 top-4 z-30 flex w-[min(100%,26rem)] flex-col overflow-hidden rounded-2xl border border-wn-mono-800 bg-wn-mono-900 shadow-2xl";

const inspectorModalPanelClassName =
  "relative z-10 flex h-[88vh] w-full max-w-[min(100%,84rem)] flex-col overflow-hidden bg-transparent text-wn-mono-100 shadow-none";

const inspectorModalColumnClassName =
  "flex min-h-0 flex-col overflow-hidden rounded-2xl border border-transparent bg-wn-mono-900";

const inspectorModalGridColsClassName =
  "grid-cols-[min(100%,11rem)_minmax(0,2fr)_min(100%,17.5rem)]";

const inspectorModalHeaderClassName = [
  "grid shrink-0 items-center gap-x-3 px-3 pb-2 pt-3",
  inspectorModalGridColsClassName,
].join(" ");

const inspectorModalColumnsClassName = [
  "grid min-h-0 flex-1 items-stretch gap-x-3 overflow-hidden px-3 pb-4 pt-2",
  inspectorModalGridColsClassName,
].join(" ");

const inspectorModalOutlineClassName =
  "flex min-h-0 flex-col overflow-hidden bg-transparent";

const inspectorModalInfoClassName = [
  inspectorModalColumnClassName,
  "flex min-h-0 flex-col",
].join(" ");

const inspectorModalPropertiesClassName = [
  "flex min-h-0 flex-col overflow-hidden rounded-2xl border border-transparent bg-wn-mono-950",
  "flex min-h-0 flex-col",
].join(" ");

const inspectorImageStripClassName =
  "group/image relative h-64 shrink-0 overflow-hidden bg-wn-mono-950";

const INSPECTOR_TAB_ORDER: InspectorTabId[] = ["info", "properties"];

const inspectorTabFadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

type InspectorLayout = "sidebar" | "modal";

type InspectorProps = {
  isOpen: boolean;
  mode: InspectorMode;
  onModeChange: (mode: InspectorMode) => void;
  card: WorldCard | undefined;
  vaultPath: string;
  links: Link[];
  cardsById: Record<string, WorldCard>;
  onClose: () => void;
  onSave: (card: WorldCard) => Promise<void>;
  onDelete: (cardId: string) => Promise<void>;
  onNavigateToCard?: (cardId: string) => void;
  onCreateSocketLink?: (socketId: string, targetCardId: string) => void;
  onRemoveSocketLink?: (linkId: string) => void;
  onCreateAndLinkCard?: (
    socketId: string,
    cardType: WorldCard["card_type"],
    name: string,
  ) => void;
};

function propertiesToRows(
  properties: Record<string, unknown>,
): PropertyRow[] {
  return Object.entries(properties).map(([key, value]) => ({
    key,
    value: typeof value === "string" ? value : JSON.stringify(value),
  }));
}

function rowsToProperties(rows: PropertyRow[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const row of rows) {
    const key = row.key.trim();
    if (!key) {
      continue;
    }
    result[key] = row.value;
  }
  return result;
}

function InspectorImageReadOnly({
  src,
  position,
}: {
  src: string;
  position: CardImagePosition;
}) {
  const imageStyle = cardImageObjectStyles("fill", position);
  return (
    <img
      src={src}
      alt=""
      className="h-full w-full select-none object-cover"
      style={imageStyle}
      draggable={false}
    />
  );
}

export function Inspector({
  isOpen,
  mode,
  onModeChange,
  card,
  vaultPath,
  links,
  cardsById,
  onClose,
  onSave,
  onDelete,
  onNavigateToCard,
  onCreateSocketLink,
  onRemoveSocketLink,
  onCreateAndLinkCard,
}: InspectorProps) {
  const lastCardRef = useRef<WorldCard | undefined>(undefined);
  if (card) {
    lastCardRef.current = card;
  }
  const activeCard = card ?? lastCardRef.current;
  const readOnly = mode === "read";

  const reducedMotion = usePrefersReducedMotion();
  const theme = useResolvedTheme();
  const logoTone = theme === "dark" ? "white" : "black";
  const [layout, setLayout] = useState<InspectorLayout>("sidebar");
  const layoutTransitionLockRef = useRef(false);

  const releaseLayoutTransitionLock = useCallback(() => {
    window.setTimeout(() => {
      layoutTransitionLockRef.current = false;
    }, 400);
  }, []);

  const applyInspectorLayoutChange = useCallback(
    (next: InspectorLayout) => {
      layoutTransitionLockRef.current = true;
      setLayout(next);
      releaseLayoutTransitionLock();
    },
    [releaseLayoutTransitionLock],
  );

  const scheduleInspectorLayoutOnPointerUp = useCallback(
    (next: InspectorLayout) => {
      const apply = () => {
        window.removeEventListener("pointerup", apply);
        window.removeEventListener("pointercancel", apply);
        applyInspectorLayoutChange(next);
      };
      window.addEventListener("pointerup", apply, { once: true });
      window.addEventListener("pointercancel", apply, { once: true });
    },
    [applyInspectorLayoutChange],
  );

  const handleInspectorLayoutPointerDown = useCallback(
    (next: InspectorLayout) => (event: PointerEvent) => {
      event.stopPropagation();
      if (event.button !== 0) {
        return;
      }
      scheduleInspectorLayoutOnPointerUp(next);
    },
    [scheduleInspectorLayoutOnPointerUp],
  );

  const handleInspectorLayoutClick = useCallback(
    (next: InspectorLayout) => (event: MouseEvent) => {
      event.stopPropagation();
      if (event.detail === 0) {
        applyInspectorLayoutChange(next);
      }
    },
    [applyInspectorLayoutChange],
  );

  const handleInspectorClose = useCallback(() => {
    if (layoutTransitionLockRef.current) {
      return;
    }
    onClose();
  }, [onClose]);
  const [loreEditor, setLoreEditor] = useState<Editor | null>(null);
  const [loreScrollElement, setLoreScrollElement] = useState<HTMLElement | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<InspectorTabId>("info");
  const [tabDirection, setTabDirection] = useState<StepDirection>(1);
  const tabIndexRef = useRef(0);
  const [name, setName] = useState(activeCard?.name ?? "");
  const [subtitle, setSubtitle] = useState(activeCard?.subtitle ?? "");
  const [lore, setLore] = useState(activeCard?.lore ?? "");
  const [tags, setTags] = useState<string[]>(activeCard?.tags ?? []);
  const [typeFields, setTypeFields] = useState<TypeSpecificEditorState>(() =>
    activeCard
      ? typeFieldsFromCard(activeCard)
      : defaultTypeFields("character"),
  );
  const [imagePath, setImagePath] = useState(activeCard?.image_path ?? "");
  const [crestPath, setCrestPath] = useState(() =>
    activeCard?.card_type === "family" ? (activeCard.crest_path ?? "") : "",
  );
  const [imagePosition, setImagePosition] = useState<CardImagePosition>(() =>
    activeCard
      ? normalizeCardImageDisplay(undefined, activeCard.image_position).position
      : DEFAULT_CARD_IMAGE_POSITION,
  );
  const [propertyRows, setPropertyRows] = useState<PropertyRow[]>(() =>
    activeCard ? propertiesToRows(activeCard.custom_properties) : [],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loreEditorRef = useRef<LoreSimpleEditorHandle>(null);
  const loadedInspectorCardIdRef = useRef<string | null>(null);

  const handleLoreEditorReady = useCallback((editor: Editor | null) => {
    setLoreEditor(editor);
    requestAnimationFrame(() => {
      setLoreScrollElement(loreEditorRef.current?.getScrollElement() ?? null);
    });
  }, []);

  useEffect(() => {
    if (layout !== "modal") {
      setLoreEditor(null);
      setLoreScrollElement(null);
    }
  }, [layout]);

  const handleInspectorTabChange = useCallback((tab: InspectorTabId) => {
    const nextIndex = INSPECTOR_TAB_ORDER.indexOf(tab);
    setTabDirection(nextIndex >= tabIndexRef.current ? 1 : -1);
    tabIndexRef.current = nextIndex;
    setActiveTab(tab);
  }, []);

  useEffect(() => {
    if (!card) {
      loadedInspectorCardIdRef.current = null;
      return;
    }
    const cardChanged = loadedInspectorCardIdRef.current !== card.id;
    loadedInspectorCardIdRef.current = card.id;
    setActiveTab("info");
    tabIndexRef.current = 0;
    if (!cardChanged) {
      return;
    }
    setName(card.name);
    setSubtitle(card.subtitle ?? "");
    setLore(stripLeadingLoreHeading(card.lore ?? ""));
    setTags(card.tags);
    setTypeFields(typeFieldsFromCard(card));
    setImagePath(card.image_path ?? "");
    setCrestPath(card.card_type === "family" ? (card.crest_path ?? "") : "");
    setImagePosition(
      normalizeCardImageDisplay(undefined, card.image_position).position,
    );
    setPropertyRows(propertiesToRows(card.custom_properties));
    setError(null);
  }, [card]);

  const socketEntries = activeCard
    ? listSocketsForCardType(activeCard.card_type)
    : [];
  const socketLinkLabels = activeCard
    ? getSocketLinkLabels(activeCard.id, links, (cardId) => cardsById[cardId]?.name)
    : {};

  const imagePreview = cardImageSrc(vaultPath, imagePath);
  const crestPreview =
    activeCard?.card_type === "family"
      ? (cardImageSrc(vaultPath, crestPath) ?? null)
      : null;
  const groupMembers = useMemo(() => {
    if (!activeCard || activeCard.card_type !== "group") {
      return [];
    }
    return cardsInGroup(activeCard.id, cardsById);
  }, [activeCard, cardsById]);

  const buildCard = useCallback((): WorldCard => {
    if (!activeCard) {
      throw new Error("No card to save");
    }
    const savedLoreMarkdown =
      loreEditorRef.current?.getMarkdown() ?? lore;
    const base = {
      id: activeCard.id,
      name: name.trim(),
      parent_id: activeCard.parent_id,
      position: activeCard.position,
      tags,
      description: descriptionSummaryFromMarkdown(savedLoreMarkdown),
      subtitle: subtitle.trim() || undefined,
      lore: savedLoreMarkdown.trim() || undefined,
      image_path: imagePath.trim() || undefined,
      image_position: imagePath.trim() ? imagePosition : undefined,
      ...(activeCard.card_type === "family"
        ? { crest_path: crestPath.trim() || undefined }
        : {}),
      custom_properties: rowsToProperties(propertyRows),
    };
    return buildWorldCard(activeCard, base, typeFields);
  }, [
    activeCard,
    crestPath,
    imagePath,
    imagePosition,
    lore,
    name,
    tags,
    propertyRows,
    subtitle,
    typeFields,
  ]);

  const handleViewJson = useCallback(async () => {
    if (!activeCard) {
      return;
    }
    setError(null);
    try {
      await openCardJsonInExternalApp(buildCard());
    } catch (viewError) {
      setError(
        viewError instanceof Error ? viewError.message : String(viewError),
      );
    }
  }, [activeCard, buildCard]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    const loreMarkdown = loreEditorRef.current?.getMarkdown();
    if (loreMarkdown !== undefined) {
      setLore(loreMarkdown);
    }
    setIsSaving(true);
    setError(null);
    try {
      await onSave(buildCard());
      onModeChange("read");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : String(saveError),
      );
    } finally {
      setIsSaving(false);
    }
  }, [buildCard, name, onModeChange, onSave]);

  const handlePickImage = useCallback(async () => {
    if (!activeCard) {
      return;
    }
    setError(null);
    try {
      const sourcePath = await pickCardImageFile();
      if (!sourcePath) {
        return;
      }
      const relativePath = await saveCardImage(vaultPath, activeCard.id, sourcePath);
      setImagePath(relativePath);
    } catch (imageError) {
      setError(
        imageError instanceof Error ? imageError.message : String(imageError),
      );
    }
  }, [activeCard, vaultPath]);

  const handlePickCrest = useCallback(async () => {
    if (!activeCard || activeCard.card_type !== "family") {
      return;
    }
    setError(null);
    try {
      const sourcePath = await pickCardImageFile();
      if (!sourcePath) {
        return;
      }
      const relativePath = await saveFamilyCrest(
        vaultPath,
        activeCard.id,
        sourcePath,
      );
      setCrestPath(relativePath);
    } catch (crestError) {
      setError(
        crestError instanceof Error ? crestError.message : String(crestError),
      );
    }
  }, [activeCard, vaultPath]);

  const handleDelete = useCallback(async () => {
    if (!activeCard) {
      return;
    }
    if (
      !window.confirm(
        `Delete "${activeCard.name}"? This removes the card from your world.`,
      )
    ) {
      return;
    }
    setIsDeleting(true);
    setError(null);
    try {
      await onDelete(activeCard.id);
      onClose();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : String(deleteError),
      );
    } finally {
      setIsDeleting(false);
    }
  }, [activeCard, onClose, onDelete]);

  const isBusy = isSaving || isDeleting;

  usePanelHotkeys({
    enabled: isOpen && !isBusy,
    onEscape: () => {
      handleInspectorClose();
    },
    onSave: readOnly ? undefined : () => {
      void handleSave();
    },
    canSave: !readOnly && Boolean(name.trim()),
    onDelete: readOnly ? undefined : () => {
      void handleDelete();
    },
    canDelete: !readOnly,
  });

  const typeVisual = activeCard
    ? visualConfigFor(activeCard.card_type)
    : null;
  const typeLabel = typeVisual?.label ?? "";

  if (!activeCard) {
    return null;
  }

  const inspectorSaveCloseActions = (
    <>
      <button
        type="button"
        className={inspectorHeaderActionClassName}
        disabled={isBusy || (!readOnly && !name.trim())}
        onClick={() => {
          if (readOnly) {
            onModeChange("edit");
          } else {
            void handleSave();
          }
        }}
      >
        <MaterialSymbol
          name={readOnly ? "edit" : "save"}
          className="text-[18px]"
        />
        {readOnly ? "Edit" : isSaving ? "Saving…" : "Save"}
      </button>
      <button
        type="button"
        className={inspectorHeaderIconActionClassName}
        onClick={onClose}
        disabled={isBusy}
        aria-label="Close inspector"
        title="Close"
      >
        <MaterialSymbol name="close" className="text-[18px]" />
      </button>
    </>
  );

  const inspectorHeader =
    layout === "modal" ? (
      <header className={inspectorModalHeaderClassName}>
        <button
          type="button"
          className={`${inspectorHeaderActionClassName} col-start-2 justify-self-start`}
          aria-label="Dock inspector"
          title="Dock to sidebar"
          disabled={isBusy}
          onPointerDown={handleInspectorLayoutPointerDown("sidebar")}
          onClick={handleInspectorLayoutClick("sidebar")}
        >
          <MaterialSymbol name="close_fullscreen" className="text-[18px]" />
          Dock
        </button>
        <div className="col-start-3 flex items-center justify-end gap-0.5">
          {inspectorSaveCloseActions}
        </div>
      </header>
    ) : (
      <header className="flex shrink-0 items-center justify-between gap-0.5 border-b border-wn-mono-800 px-4 py-3">
        <button
          type="button"
          className={inspectorHeaderIconActionClassName}
          aria-label="Expand inspector"
          title="Expand"
          disabled={isBusy}
          onPointerDown={handleInspectorLayoutPointerDown("modal")}
          onClick={handleInspectorLayoutClick("modal")}
        >
          <MaterialSymbol name="open_in_full" className="text-[18px]" />
        </button>
        <div className="flex items-center gap-0.5">
          {inspectorSaveCloseActions}
        </div>
      </header>
    );

  const modalInspectorBody = (
    <>
      {inspectorHeader}
      <div className={inspectorModalColumnsClassName}>
        <div className={inspectorModalOutlineClassName}>
          <DocumentOutline
            editor={loreEditor}
            scrollElement={loreScrollElement}
          />
        </div>
        <div className={inspectorModalInfoClassName}>
          <InfoColumn
            readOnly={readOnly}
            cardType={activeCard.card_type}
            name={name}
            subtitle={subtitle}
            lore={lore}
            logoTone={logoTone}
            isMoreMenuDisabled={isBusy}
            loreEditorRef={loreEditorRef}
            onNameChange={setName}
            onSubtitleChange={setSubtitle}
            onLoreChange={setLore}
            onEditorReady={handleLoreEditorReady}
            onViewJson={() => {
              void handleViewJson();
            }}
          />
        </div>
        <div className={inspectorModalPropertiesClassName}>
          <PropertiesColumn
          readOnly={readOnly}
          card={activeCard}
          cardsById={cardsById}
          vaultPath={vaultPath}
          links={links}
          imagePreview={imagePreview ?? null}
          imagePath={imagePath}
          imagePosition={imagePosition}
          isBusy={isBusy}
          tags={tags}
          onTagsChange={setTags}
          typeFields={typeFields}
          onTypeFieldsChange={setTypeFields}
          socketEntries={socketEntries}
          socketLinkLabels={socketLinkLabels}
          formatSocketId={formatSocketId}
          formatSocketLinkValue={formatSocketLinkValue}
          propertyRows={propertyRows}
          onPropertyRowsChange={setPropertyRows}
          onPickImage={() => {
            void handlePickImage();
          }}
          onRemoveImage={() => setImagePath("")}
          onPositionChange={setImagePosition}
          crestPreview={crestPreview}
          crestPath={crestPath}
          onPickCrest={() => {
            void handlePickCrest();
          }}
          onRemoveCrest={() => setCrestPath("")}
          groupMembers={groupMembers}
          onNavigateToCard={onNavigateToCard}
          isDeleting={isDeleting}
          onDelete={() => {
            void handleDelete();
          }}
          onCreateSocketLink={onCreateSocketLink}
          onRemoveSocketLink={onRemoveSocketLink}
          onCreateAndLinkCard={onCreateAndLinkCard}
          />
        </div>
      </div>
      {error ? (
        <p className="shrink-0 px-5 pb-2 text-sm text-wn-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );

  const sidebarInspectorBody = (
    <>
      {inspectorHeader}

      <div className="shrink-0 border-b border-wn-mono-800 py-2">
        <InspectorTabs activeTab={activeTab} onTabChange={handleInspectorTabChange} />
      </div>

      <div className={inspectorImageStripClassName}>
        {imagePreview ? (
          readOnly ? (
            <InspectorImageReadOnly src={imagePreview} position={imagePosition} />
          ) : (
            <CardImageEditorPreview
              embedded
              showRepositionHint={false}
              src={imagePreview}
              position={imagePosition}
              onPositionChange={setImagePosition}
            />
          )
        ) : readOnly ? (
          <div className="flex h-full items-center justify-center text-sm text-wn-mono-500">
            No image
          </div>
        ) : (
          <button
            type="button"
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 text-sm text-wn-mono-500 transition-colors hover:bg-wn-mono-900 hover:text-wn-mono-400 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy}
            aria-label="Choose image"
            onClick={() => {
              void handlePickImage();
            }}
          >
            <MaterialSymbol name="add_photo_alternate" className="text-2xl" />
            Add image
          </button>
        )}

        {!readOnly && imagePreview ? (
          <InspectorImageToolbar
            imagePath={imagePath}
            imagePosition={imagePosition}
            isBusy={isBusy}
            onPickImage={() => {
              void handlePickImage();
            }}
            onRemoveImage={() => setImagePath("")}
            onPositionChange={setImagePosition}
          />
        ) : null}
      </div>

      <div className="px-5 pb-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {readOnly ? (
              <>
                <h2
                  {...getHeadingProps("h4", {
                    tone: "inverse",
                    weight: "bold",
                    className: "m-0",
                  })}
                >
                  {name}
                </h2>
                {subtitle.trim() ? (
                  <p className="m-0 text-base font-medium leading-snug text-wn-mono-300">
                    {subtitle}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <Input
                  id="inspector-name"
                  aria-label="Name"
                  placeholder="Name"
                  value={name}
                  variant="flat"
                  onValueChange={setName}
                  classNames={inspectorNameFieldClassNames}
                />
                <Input
                  id="inspector-subtitle"
                  aria-label="Subtitle"
                  placeholder="Subtitle or alias"
                  value={subtitle}
                  variant="flat"
                  onValueChange={setSubtitle}
                  classNames={inspectorSubtitleFieldClassNames}
                />
              </>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {typeVisual ? (
              <CardTypePill
                className={typeVisual.badgeClassName}
                textClassName={typeVisual.badgeTextColor}
              >
                {typeLabel}
              </CardTypePill>
            ) : null}
            <InspectorCardMoreMenu
              disabled={isBusy}
              onViewJson={() => {
                void handleViewJson();
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div
          className={[
            "scrollbar-wn flex min-h-0 flex-1 flex-col overflow-x-clip pt-2",
            !readOnly && activeTab === "info"
              ? "overflow-hidden"
              : "overflow-y-auto pb-6",
          ].join(" ")}
        >
          <AnimatePresence mode="wait" custom={tabDirection}>
            <motion.div
              key={activeTab}
              custom={tabDirection}
              className={
                activeTab === "info"
                  ? "flex min-h-0 flex-1 flex-col"
                  : "flex flex-col"
              }
              variants={
                reducedMotion
                  ? inspectorTabFadeVariants
                  : stepTransitionVariants
              }
              initial="enter"
              animate="center"
              exit="exit"
              transition={
                reducedMotion ? { duration: 0.15 } : stepTransition
              }
            >
              {activeTab === "info" ? (
                <InfoTab
                  readOnly={readOnly}
                  lore={lore}
                  vaultPath={vaultPath}
                  loreEditorRef={loreEditorRef}
                  onLoreChange={setLore}
                  onNavigateToCard={onNavigateToCard}
                  groupMembers={groupMembers}
                />
              ) : (
                <PropertiesTab
                  readOnly={readOnly}
                  tags={tags}
                  onTagsChange={setTags}
                  card={activeCard}
                  cardsById={cardsById}
                  links={links}
                  cardType={activeCard.card_type}
                  typeFields={typeFields}
                  onTypeFieldsChange={setTypeFields}
                  socketEntries={socketEntries}
                  socketLinkLabels={socketLinkLabels}
                  formatSocketId={formatSocketId}
                  formatSocketLinkValue={formatSocketLinkValue}
                  propertyRows={propertyRows}
                  onPropertyRowsChange={setPropertyRows}
                  isBusy={isBusy}
                  onCreateSocketLink={onCreateSocketLink}
                  onRemoveSocketLink={onRemoveSocketLink}
                  onCreateAndLinkCard={onCreateAndLinkCard}
                />
              )}
            </motion.div>
          </AnimatePresence>
          {error ? (
            <p className="mt-4 px-5 text-sm text-wn-red-400" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        {!readOnly ? (
          <div className="shrink-0 border-t border-wn-mono-800 px-5 py-4">
            <InspectorDeleteButton
              isBusy={isBusy}
              isDeleting={isDeleting}
              onDelete={() => {
                void handleDelete();
              }}
            />
          </div>
        ) : null}
      </div>
    </>
  );

  if (layout === "modal") {
    return (
      <AnimatedModal
        isOpen={isOpen}
        onClose={handleInspectorClose}
        closeDisabled={isBusy}
        backdropDismissGuardMs={400}
        panelClassName={inspectorModalPanelClassName}
      >
        {modalInspectorBody}
      </AnimatedModal>
    );
  }

  return (
    <AnimatedPanel isOpen={isOpen} className={inspectorSidebarClassName}>
      {sidebarInspectorBody}
    </AnimatedPanel>
  );
}
