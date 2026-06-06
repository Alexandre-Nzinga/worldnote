import { Input } from "@heroui/react";
import {
  AnimatedModal,
  Button,
  CloseIconButton,
  fieldLabelClassName,
  getBodyTextStyle,
  getHeadingProps,
  MaterialSymbol,
} from "@worldnote/ui";
import { useCallback, useEffect, useState } from "react";
import { useVault } from "../../hooks/useVault.js";
import { useVaultCommands } from "../../hooks/useVaultCommands.js";
import { toast } from "../../services/notifications/toast.js";
import { pickCardImageFile } from "../../services/desktop/saveCardImage.js";
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
  const { renameWorld, saveWorldCover, deleteWorld } = useVaultCommands();
  const currentVaultPath = useVault((state) => state.currentVaultPath);
  const setCurrentVault = useVault((state) => state.setCurrentVault);

  const [name, setName] = useState("");
  const [worldPath, setWorldPath] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isOpen || !world) {
      setName("");
    setWorldPath("");
    setConfirmDelete(false);
    setIsBusy(false);
      return;
    }
    setName(world.name);
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

  const handleSaveRename = useCallback(async () => {
    const trimmed = name.trim();
    if (!worldPath || !trimmed || trimmed === world?.name) {
      onClose();
      return;
    }
    setIsBusy(true);
    try {
      const oldPath = worldPath;
      const newPath = await renameWorld(worldPath, trimmed);
      if (currentVaultPath === worldPath) {
        setCurrentVault(newPath, trimmed);
      }
      setWorldPath(newPath);
      onWorldRenamed?.(oldPath, newPath);
      onWorldsChanged();
      toast.success("World renamed");
      onClose();
    } catch (renameError) {
      toast.error(
        renameError instanceof Error
          ? renameError.message
          : String(renameError),
      );
    } finally {
      setIsBusy(false);
    }
  }, [
    currentVaultPath,
    name,
    onClose,
    onWorldRenamed,
    onWorldsChanged,
    renameWorld,
    setCurrentVault,
    world?.name,
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

  const nameChanged = world ? name.trim() !== world.name : false;
  const canSaveRename = name.trim().length > 0 && nameChanged && !isBusy;

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
            Rename this world, change its cover image, or delete it from your
            vault.
          </p>
        </div>
        <CloseIconButton
          aria-label="Close world settings"
          isDisabled={isBusy}
          onPress={onClose}
        />
      </header>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="world-settings-name" className={fieldLabelClassName}>
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

        <div className="flex flex-col gap-1">
          <span className={fieldLabelClassName}>Edit cover image</span>
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
          <p className="text-sm text-wn-mono-400">
            Delete &ldquo;{world?.name}&rdquo; and all of its cards? This cannot
            be undone.
          </p>
        ) : null}
      </div>

      <footer className="flex shrink-0 items-center justify-end gap-2 pt-2">
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
          )}
          <Button
            variant="white"
            size="base"
            className={modalPrimaryButtonClassName}
            isDisabled={!canSaveRename}
            onPress={() => {
              void handleSaveRename();
            }}
          >
            Save name
          </Button>
      </footer>
    </AnimatedModal>
  );
}
