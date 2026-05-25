import { Input, Textarea } from "@heroui/react";
import { AnimatedPanel, Button } from "@worldnote/ui";
import {
  CARD_TYPE_LABELS,
  DEFAULT_CARD_IMAGE_POSITION,
  normalizeCardImageDisplay,
  type CardImagePosition,
  listSocketsForCardType,
  type Link,
  type WorldCard,
} from "@worldnote/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  darkFieldInputClassNames,
  modalFieldLabelClassName,
  modalPrimaryButtonClassName,
} from "../Onboarding/fieldClassNames.js";
import { cardImageSrc } from "../../services/canvas/cardNodeData.js";
import { pickCardImageFile, saveCardImage } from "../../services/desktop/saveCardImage.js";
import {
  formatSocketLinkValue,
  getSocketLinkLabels,
} from "../../services/links/socketLinks.js";
import { formatSocketId } from "../../services/settings/visibleSocketSettings.js";
import { CardImageEditorPreview } from "./CardImageEditorPreview.js";
import { CardTypeFields } from "./CardTypeFields.js";
import {
  buildWorldCard,
  defaultTypeFields,
  typeFieldsFromCard,
  type TypeSpecificEditorState,
} from "./cardEditorTypes.js";

type PropertyRow = { key: string; value: string };

const panelClassName =
  "pointer-events-auto absolute right-4 top-4 z-30 flex max-h-[calc(100vh-7rem)] w-[min(100%,22rem)] flex-col overflow-hidden rounded-2xl border border-wn-mono-800 bg-wn-mono-900 shadow-2xl";

type CardEditorPanelProps = {
  isOpen: boolean;
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

export function CardEditorPanel({
  isOpen,
  card,
  vaultPath,
  links,
  cardsById,
  onClose,
  onSave,
  onDelete,
}: CardEditorPanelProps) {
  const lastCardRef = useRef<WorldCard | undefined>(undefined);
  if (card) {
    lastCardRef.current = card;
  }
  const activeCard = card ?? lastCardRef.current;

  const [name, setName] = useState(activeCard?.name ?? "");
  const [description, setDescription] = useState(activeCard?.description ?? "");
  const [tags, setTags] = useState(
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
    setName(card.name);
    setDescription(card.description ?? "");
    setTags(tagsToString(card.tags));
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

  const buildCard = useCallback((): WorldCard => {
    if (!activeCard) {
      throw new Error("No card to save");
    }
    const base = {
      id: activeCard.id,
      name: name.trim(),
      parent_id: activeCard.parent_id,
      position: activeCard.position,
      tags: stringToTags(tags),
      description: description.trim() || undefined,
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
    name,
    propertyRows,
    tags,
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
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : String(saveError),
      );
    } finally {
      setIsSaving(false);
    }
  }, [buildCard, name, onClose, onSave]);

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
    <AnimatedPanel isOpen={isOpen} className={panelClassName}>
      <header className="flex items-start justify-between gap-3 border-b border-wn-mono-800 px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-wn-mono-500">
            {typeLabel}
          </p>
          <h2 className="text-lg font-semibold text-wn-mono-50">Edit card</h2>
        </div>
        <button
          type="button"
          className="rounded-lg px-2 py-1 text-sm text-wn-mono-400 transition-colors hover:bg-wn-mono-800 hover:text-wn-mono-50"
          onClick={onClose}
          disabled={isBusy}
        >
          Close
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className={modalFieldLabelClassName}>Image</span>
            {imagePreview ? (
              <CardImageEditorPreview
                src={imagePreview}
                position={imagePosition}
                onPositionChange={setImagePosition}
              />
            ) : (
              <div className="flex aspect-5/3 items-center justify-center rounded-xl border border-wn-mono-700 bg-wn-mono-950 text-sm text-wn-mono-500">
                No image
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                isDisabled={isBusy}
                onPress={() => {
                  void handlePickImage();
                }}
              >
                Choose image
              </Button>
              {imagePath ? (
                <Button
                  variant="ghost"
                  size="sm"
                  isDisabled={isBusy}
                  onPress={() => setImagePath("")}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="card-name" className={modalFieldLabelClassName}>
              Name <span className="text-wn-red-500">*</span>
            </label>
            <Input
              id="card-name"
              value={name}
              onValueChange={setName}
              classNames={darkFieldInputClassNames}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="card-description"
              className={modalFieldLabelClassName}
            >
              Description
            </label>
            <Textarea
              id="card-description"
              minRows={3}
              value={description}
              onValueChange={setDescription}
              classNames={darkFieldInputClassNames}
            />
          </div>

          {socketEntries.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div>
                <span className={modalFieldLabelClassName}>Connections</span>
                <p className="text-xs text-wn-mono-500">
                  Wire cards on the canvas to fill these fields. Empty until
                  linked.
                </p>
              </div>
              {socketEntries.map(({ id, descriptor }) => (
                <div key={id} className="flex flex-col gap-1">
                  <label
                    htmlFor={`socket-${id}`}
                    className={modalFieldLabelClassName}
                  >
                    {formatSocketId(id)}
                  </label>
                  <Input
                    id={`socket-${id}`}
                    readOnly
                    placeholder={`Link a ${descriptor.accepts.join(" or ")} card`}
                    value={formatSocketLinkValue(socketLinkLabels[id])}
                    classNames={darkFieldInputClassNames}
                  />
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex flex-col gap-1">
            <label htmlFor="card-tags" className={modalFieldLabelClassName}>
              Tags
            </label>
            <Input
              id="card-tags"
              placeholder="hero, faction"
              value={tags}
              onValueChange={setTags}
              classNames={darkFieldInputClassNames}
            />
          </div>

          <CardTypeFields
            cardType={activeCard.card_type}
            fields={typeFields}
            onChange={setTypeFields}
            disabled={isBusy}
          />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className={modalFieldLabelClassName}>Custom properties</span>
              <Button
                variant="ghost"
                size="sm"
                isDisabled={isBusy}
                onPress={() =>
                  setPropertyRows((rows) => [...rows, { key: "", value: "" }])
                }
              >
                Add
              </Button>
            </div>
            {propertyRows.length === 0 ? (
              <p className="text-xs text-wn-mono-500">No custom properties yet.</p>
            ) : (
              propertyRows.map((row, index) => (
                <div key={`${row.key}-${index}`} className="flex gap-2">
                  <Input
                    aria-label="Property name"
                    placeholder="Key"
                    value={row.key}
                    onValueChange={(next) =>
                      setPropertyRows((rows) =>
                        rows.map((entry, rowIndex) =>
                          rowIndex === index ? { ...entry, key: next } : entry,
                        ),
                      )
                    }
                    classNames={{
                      ...darkFieldInputClassNames,
                      base: "flex-1",
                    }}
                  />
                  <Input
                    aria-label="Property value"
                    placeholder="Value"
                    value={row.value}
                    onValueChange={(next) =>
                      setPropertyRows((rows) =>
                        rows.map((entry, rowIndex) =>
                          rowIndex === index ? { ...entry, value: next } : entry,
                        ),
                      )
                    }
                    classNames={{
                      ...darkFieldInputClassNames,
                      base: "flex-[2]",
                    }}
                  />
                  <button
                    type="button"
                    className="shrink-0 rounded-lg px-2 text-wn-mono-500 hover:bg-wn-mono-800 hover:text-wn-red-400"
                    aria-label="Remove property"
                    disabled={isBusy}
                    onClick={() =>
                      setPropertyRows((rows) =>
                        rows.filter((_, rowIndex) => rowIndex !== index),
                      )
                    }
                  >
                    <i className="ri-delete-bin-line text-base" aria-hidden />
                  </button>
                </div>
              ))
            )}
          </div>

          {error ? (
            <p className="text-sm text-wn-red-400" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <footer className="flex flex-col gap-2 border-t border-wn-mono-800 px-4 py-3">
        <Button
          variant="white"
          size="base"
          className={modalPrimaryButtonClassName}
          isDisabled={isBusy || !name.trim()}
          onPress={() => {
            void handleSave();
          }}
        >
          {isSaving ? "Saving…" : "Save card"}
        </Button>
        <Button
          variant="danger"
          size="base"
          isDisabled={isBusy}
          onPress={() => {
            void handleDelete();
          }}
        >
          {isDeleting ? "Deleting…" : "Delete card"}
        </Button>
      </footer>
    </AnimatedPanel>
  );
}
