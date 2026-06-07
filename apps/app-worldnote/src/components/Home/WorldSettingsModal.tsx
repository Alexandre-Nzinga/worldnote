import { Input, Textarea } from "@heroui/react";
import {
  AnimatedModal,
  Button,
  CloseIconButton,
  wnLabelClassName,
  getBodyTextStyle,
  getHeadingProps,
  InlineAlert,
  MaterialSymbol,
} from "@worldnote/ui";
import { useCallback, useEffect, useState } from "react";
import { useVault } from "../../hooks/useVault.js";
import { useVaultCommands } from "../../hooks/useVaultCommands.js";
import { toast } from "../../services/notifications/toast.js";
import { pickCardImageFile } from "../../services/desktop/saveCardImage.js";
import {
  exportWorld,
  pickWorldExportDestination,
} from "../../services/worlds/worldTransfer.js";
import type { WorldSummary } from "../../services/worlds/listWorlds.js";
import {
  darkFieldInputClassNames,
  modalPrimaryButtonClassName,
} from "../Onboarding/fieldClassNames.js";

type WorldSettingsModalProps = {
  world: WorldSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onWorldsChanged: () => void;
  onWorldRenamed?: (oldPath: string, newPath: string) => void;
  onWorldDeleted?: (path: string) => void;
};

export function WorldSettingsModal({
  world,
  isOpen,
  onClose,
  onWorldsChanged,
  onWorldRenamed,
  onWorldDeleted,
}: WorldSettingsModalProps) {
  const { renameWorld, updateWorldDescription, saveWorldCover, deleteWorld } =
    useVaultCommands();
  const currentVaultPath = useVault((state) => state.currentVaultPath);
  const setCurrentVault = useVault((state) => state.setCurrentVault);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [worldPath, setWorldPath] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isOpen || !world) {
      setName("");
      setDescription("");
      setWorldPath("");
      setConfirmDelete(false);
      setIsBusy(false);
      return;
    }
    setName(world.name);
    setDescription(world.description ?? "");
    setWorldPath(world.path);
    setConfirmDelete(false);
  }, [isOpen, world]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isBusy) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isBusy, isOpen, onClose]);

  const handleSaveChanges = useCallback(async () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    if (!worldPath || !trimmedName) {
      return;
    }

    const shouldRename = world ? trimmedName !== world.name : false;
    const shouldUpdateDescription = world
      ? trimmedDescription !== (world.description ?? "")
      : false;

    if (!shouldRename && !shouldUpdateDescription) {
      onClose();
      return;
    }

    setIsBusy(true);
    try {
      let nextPath = worldPath;
      if (shouldRename) {
        const oldPath = worldPath;
        nextPath = await renameWorld(worldPath, trimmedName);
        if (currentVaultPath === worldPath) {
          setCurrentVault(nextPath, trimmedName);
        }
        setWorldPath(nextPath);
        onWorldRenamed?.(oldPath, nextPath);
      }

      if (shouldUpdateDescription) {
        await updateWorldDescription(nextPath, trimmedDescription);
      }

      onWorldsChanged();
      toast.success("World updated");
      onClose();
    } catch (saveError) {
      toast.error(
        saveError instanceof Error ? saveError.message : String(saveError),
      );
    } finally {
      setIsBusy(false);
    }
  }, [
    currentVaultPath,
    description,
    name,
    onClose,
    onWorldRenamed,
    onWorldsChanged,
    renameWorld,
    setCurrentVault,
    updateWorldDescription,
    world,
    worldPath,
  ]);

  const handleEditCover = useCallback(async () => {
    if (!worldPath) {
      return;
    }
    setIsBusy(true);
    try {
      const sourcePath = await pickCardImageFile();
      if (!sourcePath) {
        return;
      }
      await saveWorldCover(worldPath, sourcePath);
      onWorldsChanged();
      toast.success("Cover image updated");
      onClose();
    } catch (coverError) {
      toast.error(
        coverError instanceof Error ? coverError.message : String(coverError),
      );
    } finally {
      setIsBusy(false);
    }
  }, [onClose, onWorldsChanged, saveWorldCover, worldPath]);

  const handleExport = useCallback(async () => {
    if (!worldPath || !world) {
      return;
    }
    setIsBusy(true);
    try {
      const destinationPath = await pickWorldExportDestination(world.name);
      if (!destinationPath) {
        return;
      }
      await exportWorld(worldPath, destinationPath);
      toast.success(`"${world.name}" exported`);
      onClose();
    } catch (exportError) {
      toast.error(
        exportError instanceof Error
          ? exportError.message
          : String(exportError),
      );
    } finally {
      setIsBusy(false);
    }
  }, [onClose, world, worldPath]);

  const handleDelete = useCallback(async () => {
    if (!worldPath) {
      return;
    }
    setIsBusy(true);
    try {
      const deletedPath = worldPath;
      const deletedName = world?.name ?? "World";
      await deleteWorld(worldPath);
      if (currentVaultPath === worldPath) {
        setCurrentVault(null);
      }
      onWorldDeleted?.(deletedPath);
      onWorldsChanged();
      toast.success(`"${deletedName}" deleted`);
      onClose();
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error ? deleteError.message : String(deleteError),
      );
    } finally {
      setIsBusy(false);
    }
  }, [
    currentVaultPath,
    deleteWorld,
    onClose,
    onWorldDeleted,
    onWorldsChanged,
    setCurrentVault,
    world?.name,
    worldPath,
  ]);

  const trimmedName = name.trim();
  const trimmedDescription = description.trim();
  const nameChanged = world ? trimmedName !== world.name : false;
  const descriptionChanged = world
    ? trimmedDescription !== (world.description ?? "")
    : false;
  const hasUnsavedChanges = nameChanged || descriptionChanged;
  const canSaveChanges =
    trimmedName.length > 0 && hasUnsavedChanges && !isBusy;

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      closeDisabled={isBusy}
      labelledBy="world-settings-title"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2
            id="world-settings-title"
            {...getHeadingProps("h5", { tone: "inverse", weight: "semibold" })}
          >
            World settings
          </h2>
          <p style={getBodyTextStyle("small")}>
            Rename this world, edit its description, export a backup, change its
            cover image, or delete it from your vault.
          </p>
        </div>
        <CloseIconButton
          aria-label="Close world settings"
          isDisabled={isBusy}
          onPress={onClose}
        />
      </header>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="world-settings-name" className={wnLabelClassName}>
            Rename
          </label>
          <Input
            id="world-settings-name"
            autoFocus
            aria-label="World name"
            placeholder="World name"
            value={name}
            onValueChange={setName}
            isDisabled={isBusy}
            classNames={darkFieldInputClassNames}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="world-settings-description"
            className={wnLabelClassName}
          >
            Description
          </label>
          <Textarea
            id="world-settings-description"
            aria-label="World description"
            placeholder="A short summary of your world (optional)"
            minRows={3}
            value={description}
            onValueChange={setDescription}
            isDisabled={isBusy}
            classNames={darkFieldInputClassNames}
          />
        </div>

        <div className="flex flex-col gap-3">
          <span className={wnLabelClassName}>Backup</span>
          <div className="self-start">
            <Button
              variant="secondary"
              size="base"
              isDisabled={isBusy}
              onPress={() => {
                void handleExport();
              }}
              startContent={
                <MaterialSymbol name="upload" className="text-base" />
              }
            >
              Export world…
            </Button>
          </div>
          <p className="text-sm leading-relaxed text-wn-mono-500">
            Saves cards, links, images, timeline data, sticky notes, and canvas
            layout to a `.worldnote.zip` file.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <span className={wnLabelClassName}>Edit cover image</span>
          <div className="self-start">
            <Button
              variant="secondary"
              size="base"
              isDisabled={isBusy}
              onPress={() => {
                void handleEditCover();
              }}
              startContent={
                <MaterialSymbol name="image" className="text-base" />
              }
            >
              Choose image…
            </Button>
          </div>
        </div>

        {confirmDelete ? (
          <InlineAlert tone="danger" title="Delete this world?">
            This will permanently delete &ldquo;{world?.name}&rdquo; and all of
            its cards. This cannot be undone.
          </InlineAlert>
        ) : null}
      </div>

      <footer className="flex shrink-0 flex-wrap items-center justify-end gap-3 pt-6">
        {confirmDelete ? (
          <>
            <Button
              variant="secondary"
              size="base"
              isDisabled={isBusy}
              onPress={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="base"
              isDisabled={isBusy}
              onPress={() => {
                void handleDelete();
              }}
            >
              Delete permanently
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="danger"
              size="base"
              isDisabled={isBusy}
              onPress={() => setConfirmDelete(true)}
              startContent={
                <MaterialSymbol name="delete" className="text-base" />
              }
            >
              Delete world
            </Button>
            {hasUnsavedChanges ? (
              <Button
                variant="white"
                size="base"
                className={modalPrimaryButtonClassName}
                isDisabled={!canSaveChanges}
                onPress={() => {
                  void handleSaveChanges();
                }}
              >
                {nameChanged && descriptionChanged
                  ? "Save changes"
                  : nameChanged
                    ? "Save name"
                    : "Save description"}
              </Button>
            ) : null}
          </>
        )}
      </footer>
    </AnimatedModal>
  );
}
