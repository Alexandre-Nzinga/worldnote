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
import { AnimatedModal, AnimatedPanel, Button, MaterialSymbol } from "@worldnote/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  modalPrimaryButtonClassName,
} from "../Onboarding/fieldClassNames.js";
import {
  inspectorImageOverlayChipClassName,
  inspectorImageOverlayLabelClassName,
  inspectorNameFieldClassNames,
  inspectorSubtitleFieldClassNames,
} from "./inspector/inspectorFieldStyles.js";
import { cardImageSrc } from "../../services/canvas/cardNodeData.js";
import { pickCardImageFile, saveCardImage } from "../../services/desktop/saveCardImage.js";
import {
  formatSocketLinkValue,
  getSocketLinkLabels,
} from "../../services/links/socketLinks.js";
import { formatSocketId } from "../../services/settings/visibleSocketSettings.js";
import { CardImageEditorPreview } from "./CardImageEditorPreview.js";
import {
  buildWorldCard,
  defaultTypeFields,
  typeFieldsFromCard,
  type TypeSpecificEditorState,
} from "./cardEditorTypes.js";
import { InfoTab } from "./inspector/InfoTab.js";
import type { LoreEditorHandle } from "./inspector/loreEditor/LoreEditor.js";
import { InspectorTabs, type InspectorTabId } from "./inspector/InspectorTabs.js";
import {
  isLoreDocEmpty,
  type LoreDoc,
} from "./inspector/loreEditor/loreDocTypes.js";
import {
  descriptionSummaryFromPlainText,
  resolveInitialLoreDoc,
} from "./inspector/loreEditor/seedLoreDoc.js";
import { PropertiesTab } from "./inspector/PropertiesTab.js";

type PropertyRow = { key: string; value: string };

export type InspectorMode = "read" | "edit";

const inspectorSidebarClassName =
  "pointer-events-auto absolute right-4 top-4 z-30 flex max-h-[calc(100vh-7rem)] w-[min(100%,22rem)] flex-col overflow-hidden rounded-2xl border border-wn-mono-800 bg-wn-mono-900 shadow-2xl";

const inspectorModalPanelClassName =
  "relative z-10 flex max-h-[min(85vh,52rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-wn-mono-800 bg-wn-mono-900 text-wn-mono-100 shadow-2xl";

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
};

function tagsToString(tags: string[]): string {
  return tags.join(", ");
}

function stringToTags(raw: string): string[] {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

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
  const { objectFit, objectPosition } = cardImageObjectStyles("fill", position);
  return (
    <div className="relative overflow-hidden bg-wn-mono-950">
      <img
        src={src}
        alt=""
        className="aspect-video w-full select-none object-cover"
        style={{ objectFit, objectPosition }}
        draggable={false}
      />
    </div>
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
}: InspectorProps) {
  const lastCardRef = useRef<WorldCard | undefined>(undefined);
  if (card) {
    lastCardRef.current = card;
  }
  const activeCard = card ?? lastCardRef.current;
  const readOnly = mode === "read";

  const [layout, setLayout] = useState<InspectorLayout>("sidebar");
  const [activeTab, setActiveTab] = useState<InspectorTabId>("info");
  const [name, setName] = useState(activeCard?.name ?? "");
  const [subtitle, setSubtitle] = useState(activeCard?.subtitle ?? "");
  const [lore, setLore] = useState(activeCard?.lore ?? "");
  const [loreDoc, setLoreDoc] = useState<LoreDoc>(() =>
    resolveInitialLoreDoc(
      activeCard?.lore_doc,
      activeCard?.lore,
      activeCard?.description,
    ),
  );
  const [tagsInput, setTagsInput] = useState(
    activeCard ? tagsToString(activeCard.tags) : "",
  );
  const [typeFields, setTypeFields] = useState<TypeSpecificEditorState>(() =>
    activeCard
      ? typeFieldsFromCard(activeCard)
      : defaultTypeFields("character"),
  );
  const [imagePath, setImagePath] = useState(activeCard?.image_path ?? "");
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
  const loreEditorRef = useRef<LoreEditorHandle>(null);

  useEffect(() => {
    if (!card) {
      return;
    }
    setActiveTab("info");
    setName(card.name);
    setSubtitle(card.subtitle ?? "");
    setLore(card.lore ?? "");
    setLoreDoc(resolveInitialLoreDoc(card.lore_doc, card.lore, card.description));
    setTagsInput(tagsToString(card.tags));
    setTypeFields(typeFieldsFromCard(card));
    setImagePath(card.image_path ?? "");
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
  const parsedTags = stringToTags(tagsInput);

  const buildCard = useCallback((): WorldCard => {
    if (!activeCard) {
      throw new Error("No card to save");
    }
    const loreSnapshot = loreEditorRef.current?.getSnapshot();
    const savedLoreDoc = loreSnapshot?.doc ?? loreDoc;
    const savedLoreText = loreSnapshot?.plainText ?? lore;
    const base = {
      id: activeCard.id,
      name: name.trim(),
      parent_id: activeCard.parent_id,
      position: activeCard.position,
      tags: parsedTags,
      description: descriptionSummaryFromPlainText(savedLoreText),
      subtitle: subtitle.trim() || undefined,
      lore: savedLoreText.trim() || undefined,
      lore_doc: isLoreDocEmpty(savedLoreDoc)
        ? undefined
        : (savedLoreDoc as Record<string, unknown>),
      image_path: imagePath.trim() || undefined,
      image_position: imagePath.trim() ? imagePosition : undefined,
      custom_properties: rowsToProperties(propertyRows),
    };
    return buildWorldCard(activeCard, base, typeFields);
  }, [
    activeCard,
    imagePath,
    imagePosition,
    lore,
    loreDoc,
    name,
    parsedTags,
    propertyRows,
    subtitle,
    typeFields,
  ]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    const loreSnapshot = loreEditorRef.current?.getSnapshot();
    if (loreSnapshot) {
      setLore(loreSnapshot.plainText);
      setLoreDoc(loreSnapshot.doc);
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
  const typeVisual = activeCard
    ? visualConfigFor(activeCard.card_type)
    : null;
  const typeLabel = typeVisual?.label ?? "";

  if (!activeCard) {
    return null;
  }

  const inspectorBody = (
    <>
      <div className="relative shrink-0">
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
        ) : (
          <div className="flex aspect-video items-center justify-center bg-wn-mono-950 text-sm text-wn-mono-500">
            No image
          </div>
        )}

        {!readOnly ? (
          <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              className={inspectorImageOverlayChipClassName}
              disabled={isBusy}
              onClick={() => {
                void handlePickImage();
              }}
            >
              Choose image
            </button>
            {imagePath ? (
              <button
                type="button"
                className={inspectorImageOverlayChipClassName}
                disabled={isBusy}
                onClick={() => setImagePath("")}
              >
                Remove
              </button>
            ) : null}
            {imagePreview ? (
              <span className={inspectorImageOverlayLabelClassName}>
                Drag to reposition
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="absolute left-3 top-3">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-wn-mono-950/80 text-wn-mono-300 transition-colors hover:bg-wn-mono-800 hover:text-wn-mono-50"
            aria-label={
              layout === "sidebar" ? "Expand inspector" : "Dock inspector"
            }
            title={layout === "sidebar" ? "Expand" : "Dock to sidebar"}
            disabled={isBusy}
            onClick={() =>
              setLayout((current) =>
                current === "sidebar" ? "modal" : "sidebar",
              )
            }
          >
            <MaterialSymbol
              name={layout === "sidebar" ? "open_in_full" : "close_fullscreen"}
              className="text-lg"
            />
          </button>
        </div>

        <div className="absolute right-3 top-3 flex gap-1">
          <button
            type="button"
            className="rounded-lg bg-wn-mono-950/80 px-2 py-1 text-sm text-wn-mono-300 transition-colors hover:bg-wn-mono-800 hover:text-wn-mono-50"
            onClick={() => onModeChange(readOnly ? "edit" : "read")}
            disabled={isBusy}
          >
            {readOnly ? "Edit" : "Done"}
          </button>
          <button
            type="button"
            className="rounded-lg bg-wn-mono-950/80 px-2 py-1 text-sm text-wn-mono-300 transition-colors hover:bg-wn-mono-800 hover:text-wn-mono-50"
            onClick={onClose}
            disabled={isBusy}
          >
            Close
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-4 pb-3 pt-4">
        <div className="flex flex-col gap-0.5">
          {readOnly ? (
            <>
              <h2 className="m-0 text-2xl font-bold leading-tight tracking-tight text-wn-mono-50">
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
        {typeVisual ? (
          <div className="flex items-center gap-2">
            <CardTypePill
              className={typeVisual.badgeClassName}
              textClassName={typeVisual.badgeTextColor}
            >
              {typeLabel}
            </CardTypePill>
          </div>
        ) : null}
      </div>

      <InspectorTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="scrollbar-wn min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {activeTab === "info" ? (
          <InfoTab
            readOnly={readOnly}
            tags={parsedTags}
            tagsInput={tagsInput}
            onTagsInputChange={setTagsInput}
            lore={lore}
            loreDoc={loreDoc as Record<string, unknown>}
            legacyDescription={activeCard.description}
            vaultPath={vaultPath}
            cardId={activeCard.id}
            cardsById={cardsById}
            loreEditorRef={loreEditorRef}
            onDescriptionChange={(plainText, doc) => {
              setLore(plainText);
              setLoreDoc(doc);
            }}
            onNavigateToCard={onNavigateToCard}
          />
        ) : null}
        {activeTab === "properties" ? (
          <PropertiesTab
            readOnly={readOnly}
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
          />
        ) : null}
        {error ? (
          <p className="mt-4 text-sm text-wn-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      {!readOnly ? (
        <footer className="flex gap-2 border-t border-wn-mono-800 px-4 py-3">
          <Button
            variant="white"
            size="base"
            className={modalPrimaryButtonClassName}
            isDisabled={isBusy || !name.trim()}
            onPress={() => {
              void handleSave();
            }}
          >
          {isSaving ? "Saving…" : "Save"}
        </Button>
        <Button
          variant="danger"
          size="base"
          isDisabled={isBusy}
          onPress={() => {
            void handleDelete();
          }}
        >
          {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </footer>
      ) : null}
    </>
  );

  if (layout === "modal") {
    return (
      <AnimatedModal
        isOpen={isOpen}
        onClose={onClose}
        closeDisabled={isBusy}
        panelClassName={inspectorModalPanelClassName}
      >
        {inspectorBody}
      </AnimatedModal>
    );
  }

  return (
    <AnimatedPanel isOpen={isOpen} className={inspectorSidebarClassName}>
      {inspectorBody}
    </AnimatedPanel>
  );
}
