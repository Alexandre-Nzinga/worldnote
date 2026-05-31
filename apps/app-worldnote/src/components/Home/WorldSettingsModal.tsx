import { Input } from "@heroui/react";
import { AnimatedModal, Button, MaterialSymbol } from "@worldnote/ui";
import { useCallback, useEffect, useState } from "react";
import { useVault } from "../../hooks/useVault.js";
import { useVaultCommands } from "../../hooks/useVaultCommands.js";
import { pickCardImageFile } from "../../services/desktop/saveCardImage.js";
import type { WorldSummary } from "../../services/worlds/listWorlds.js";
import {
  darkFieldInputClassNames,
  modalFieldLabelClassName,
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !world) {
      setName("");
      setWorldPath("");
      setConfirmDelete(false);
      setError(null);
      setIsBusy(false);
      return;
    }
    setName(world.name);
    setWorldPath(world.path);
    setConfirmDelete(false);
    setError(null);
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
    setError(null);
    try {
      const oldPath = worldPath;
      const newPath = await renameWorld(worldPath, trimmed);
      if (currentVaultPath === worldPath) {
        setCurrentVault(newPath, trimmed);
      }
      setWorldPath(newPath);
      onWorldRenamed?.(oldPath, newPath);
      onWorldsChanged();
      onClose();
    } catch (renameError) {
      setError(
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
    setError(null);
    try {
      const sourcePath = await pickCardImageFile();
      if (!sourcePath) {
        return;
      }
      await saveWorldCover(worldPath, sourcePath);
      onWorldsChanged();
      onClose();
    } catch (coverError) {
      setError(
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
    setError(null);
    try {
      const deletedPath = worldPath;
      await deleteWorld(worldPath);
      if (currentVaultPath === worldPath) {
        setCurrentVault(null);
      }
      onWorldDeleted?.(deletedPath);
      onWorldsChanged();
      onClose();
    } catch (deleteError) {
      setError(
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
      <header className="flex flex-col gap-1">
        <h2
          id="world-settings-title"
          className="text-xl font-semibold text-wn-mono-50"
        >
          World settings
        </h2>
        <p className="text-sm text-wn-mono-400">
          Rename this world, change its cover image, or delete it from your
          vault.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="world-settings-name" className={modalFieldLabelClassName}>
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
          <span className={modalFieldLabelClassName}>Edit cover image</span>
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

        <div className="flex flex-col gap-2 border-t border-wn-mono-800 pt-4">
          <span className={modalFieldLabelClassName}>Delete world</span>
          {confirmDelete ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-wn-mono-400">
                Delete &ldquo;{world?.name}&rdquo; and all of its cards? This
                cannot be undone.
              </p>
              <div className="flex gap-2">
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
              </div>
            </div>
          ) : (
            <div className="self-start">
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
            </div>
          )}
        </div>

        {error ? (
          <p className="text-sm text-wn-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <footer className="flex shrink-0 items-center justify-between gap-3 pt-2">
        <Button
          variant="secondary"
          size="base"
          isDisabled={isBusy}
          onPress={onClose}
        >
          {nameChanged ? "Cancel" : "Close"}
        </Button>
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
