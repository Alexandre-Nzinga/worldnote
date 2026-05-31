import { Input } from "@heroui/react";
import {
  cardImageObjectStyles,
  CARD_TYPE_LABELS,
  DEFAULT_CARD_IMAGE_POSITION,
  normalizeCardImageDisplay,
  type CardImagePosition,
  listSocketsForCardType,
  type Link,
  type WorldCard,
} from "@worldnote/shared";
import { AnimatedPanel, Button, Pill } from "@worldnote/ui";
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
import { InspectorTabs, type InspectorTabId } from "./inspector/InspectorTabs.js";
import { LoreTab } from "./inspector/LoreTab.js";
import { PropertiesTab } from "./inspector/PropertiesTab.js";

type PropertyRow = { key: string; value: string };

export type InspectorMode = "read" | "edit";

const inspectorClassName =
  "pointer-events-auto absolute right-4 top-4 z-30 flex max-h-[calc(100vh-7rem)] w-[min(100%,22rem)] flex-col overflow-hidden rounded-2xl border border-wn-mono-800 bg-wn-mono-900 shadow-2xl";

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
}: InspectorProps) {
  const lastCardRef = useRef<WorldCard | undefined>(undefined);
  if (card) {
    lastCardRef.current = card;
  }
  const activeCard = card ?? lastCardRef.current;
  const readOnly = mode === "read";

  const [activeTab, setActiveTab] = useState<InspectorTabId>("info");
  const [name, setName] = useState(activeCard?.name ?? "");
  const [subtitle, setSubtitle] = useState(activeCard?.subtitle ?? "");
  const [description, setDescription] = useState(activeCard?.description ?? "");
  const [lore, setLore] = useState(activeCard?.lore ?? "");
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

  useEffect(() => {
    if (!card) {
      return;
    }
    setActiveTab("info");
    setName(card.name);
    setSubtitle(card.subtitle ?? "");
    setDescription(card.description ?? "");
    setLore(card.lore ?? "");
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
    const base = {
      id: activeCard.id,
      name: name.trim(),
      parent_id: activeCard.parent_id,
      position: activeCard.position,
      tags: parsedTags,
      description: description.trim() || undefined,
      subtitle: subtitle.trim() || undefined,
      lore: lore.trim() || undefined,
      image_path: imagePath.trim() || undefined,
      image_position: imagePath.trim() ? imagePosition : undefined,
      custom_properties: rowsToProperties(propertyRows),
    };
    return buildWorldCard(activeCard, base, typeFields);
  }, [
    activeCard,
    description,
    imagePath,
    imagePosition,
    lore,
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
  const typeLabel = activeCard
    ? CARD_TYPE_LABELS[activeCard.card_type]
    : "";

  if (!activeCard) {
    return null;
  }

  return (
    <AnimatedPanel isOpen={isOpen} className={inspectorClassName}>
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

      <div className="flex flex-col gap-2 px-4 pb-3 pt-4">
        {readOnly ? (
          <>
            <h2 className="text-xl font-bold text-wn-mono-50">{name}</h2>
            {subtitle.trim() ? (
              <p className="text-sm text-wn-mono-400">{subtitle}</p>
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
        <div className="flex items-center gap-2">
          <Pill tone="amber" size="sm">
            {typeLabel}
          </Pill>
        </div>
      </div>

      <InspectorTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="scrollbar-wn min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {activeTab === "info" ? (
          <InfoTab
            readOnly={readOnly}
            description={description}
            tags={parsedTags}
            tagsInput={tagsInput}
            onDescriptionChange={setDescription}
            onTagsInputChange={setTagsInput}
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
        {activeTab === "lore" ? (
          <LoreTab readOnly={readOnly} lore={lore} onLoreChange={setLore} />
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
    </AnimatedPanel>
  );
}
