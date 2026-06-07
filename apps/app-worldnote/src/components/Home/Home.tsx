import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CreateWorldModal } from "../CreateWorldModal.js";
import { useSettings } from "../../hooks/useSettings.js";
import { useVault } from "../../hooks/useVault.js";
import { useVaultCommands } from "../../hooks/useVaultCommands.js";
import {
  getPinnedWorldPaths,
  normalizePinnedWorldPaths,
  partitionWorldsByPinned,
  remapPinnedWorldPath,
  removePinnedWorldPath,
  togglePinnedWorldPath,
} from "../../services/settings/pinnedWorlds.js";
import {
  buildStarterPackWorld,
  openSampleWorld,
  type StarterPack,
} from "../../services/starterPacks/index.js";
import {
  listWorlds,
  type WorldSummary,
} from "../../services/worlds/listWorlds.js";
import {
  importWorld,
  pickWorldArchiveFile,
} from "../../services/worlds/worldTransfer.js";
import { toast } from "../../services/notifications/toast.js";
import {
  pageBackdropClassName,
  pageShellClassName,
} from "../shell/pageShellStyles.js";
import { HomeHeader } from "./HomeHeader.js";
import { HomeHero } from "./HomeHero.js";
import { getTimeOfDayGreeting } from "./worldCover.js";
import { WorldSettingsModal } from "./WorldSettingsModal.js";
import { WorldsSection } from "./WorldsSection.js";

type HomeProps = {
  onWorldReady: () => void;
  onOpenSettings?: () => void;
  onOpenVault?: () => void;
};

export function Home({ onWorldReady, onOpenSettings, onOpenVault }: HomeProps) {
  const settings = useSettings((state) => state.settings);
  const saveSettings = useSettings((state) => state.save);
  const { openWorld } = useVaultCommands();
  const setCurrentVault = useVault((state) => state.setCurrentVault);
  const pendingStarterAction = useVault((state) => state.pendingStarterAction);
  const clearStarterAction = useVault((state) => state.clearStarterAction);

  const [worlds, setWorlds] = useState<WorldSummary[]>([]);
  const [isLoadingWorlds, setIsLoadingWorlds] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [manageWorld, setManageWorld] = useState<WorldSummary | null>(null);

  const pinnedPaths = useMemo(() => getPinnedWorldPaths(settings), [settings]);

  const persistPinnedPaths = useCallback(
    async (nextPinned: string[]) => {
      if (!settings) {
        return;
      }
      await saveSettings({ ...settings, pinnedWorldPaths: nextPinned });
    },
    [saveSettings, settings],
  );

  const refreshWorlds = useCallback(async () => {
    if (!settings?.worldnoteRoot) {
      setWorlds([]);
      setIsLoadingWorlds(false);
      return;
    }
    setIsLoadingWorlds(true);
    try {
      const next = await listWorlds(settings.worldnoteRoot);
      setWorlds(next);

      const validPaths = new Set(next.map((world) => world.path));
      const normalized = normalizePinnedWorldPaths(pinnedPaths, validPaths);
      const pathsDiffer =
        normalized.length !== pinnedPaths.length ||
        normalized.some((path, index) => path !== pinnedPaths[index]);
      if (settings && pathsDiffer) {
        await persistPinnedPaths(normalized);
      }
    } catch (error) {
      console.error("Failed to list worlds:", error);
      setWorlds([]);
    } finally {
      setIsLoadingWorlds(false);
    }
  }, [persistPinnedPaths, pinnedPaths, settings]);

  useEffect(() => {
    void refreshWorlds();
  }, [refreshWorlds]);

  useEffect(() => {
    if (pendingStarterAction !== "create-world") {
      return;
    }
    clearStarterAction();
    setIsCreateOpen(true);
  }, [clearStarterAction, pendingStarterAction]);

  const handleOpenWorld = useCallback(
    async (world: WorldSummary) => {
      setIsBusy(true);
      try {
        await openWorld(world.path);
        setCurrentVault(world.path, world.name);
        onWorldReady();
      } catch (error) {
        console.error("Failed to open world:", error);
        toast.error(
          error instanceof Error ? error.message : "Could not open this world.",
        );
      } finally {
        setIsBusy(false);
      }
    },
    [onWorldReady, openWorld, setCurrentVault],
  );

  const handleTogglePin = useCallback(
    async (world: WorldSummary) => {
      if (!settings) {
        return;
      }
      const result = togglePinnedWorldPath(pinnedPaths, world.path);
      if (result.error) {
        toast.warning(result.error);
        return;
      }
      await persistPinnedPaths(result.paths);
    },
    [persistPinnedPaths, pinnedPaths, settings],
  );

  const handleWorldRenamed = useCallback(
    async (oldPath: string, newPath: string) => {
      if (!settings || !pinnedPaths.includes(oldPath)) {
        return;
      }
      await persistPinnedPaths(
        remapPinnedWorldPath(pinnedPaths, oldPath, newPath),
      );
    },
    [persistPinnedPaths, pinnedPaths, settings],
  );

  const handleWorldDeleted = useCallback(
    async (path: string) => {
      if (!settings || !pinnedPaths.includes(path)) {
        return;
      }
      await persistPinnedPaths(removePinnedWorldPath(pinnedPaths, path));
    },
    [persistPinnedPaths, pinnedPaths, settings],
  );

  const { pinned: pinnedWorlds, unpinned: unpinnedWorlds } = useMemo(
    () => partitionWorldsByPinned(worlds, pinnedPaths),
    [pinnedPaths, worlds],
  );

  const displayWorlds = useMemo(
    () => [...pinnedWorlds, ...unpinnedWorlds],
    [pinnedWorlds, unpinnedWorlds],
  );

  const handleTrySampleWorld = useCallback(async () => {
    if (!settings?.worldnoteRoot) {
      return;
    }
    setIsBusy(true);
    try {
      const sample = await openSampleWorld(settings.worldnoteRoot);
      await openWorld(sample.path);
      setCurrentVault(sample.path, sample.name);
      onWorldReady();
    } catch (error) {
      console.error("Failed to open sample world:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not open the sample world.",
      );
    } finally {
      setIsBusy(false);
    }
  }, [onWorldReady, openWorld, setCurrentVault, settings?.worldnoteRoot]);

  const handleStartStarterPack = useCallback(
    async (pack: StarterPack) => {
      if (!settings?.worldnoteRoot) {
        return;
      }
      setIsBusy(true);
      try {
        const result = await buildStarterPackWorld(
          settings.worldnoteRoot,
          pack,
          {
            forceNew: true,
          },
        );
        await refreshWorlds();
        await openWorld(result.path);
        setCurrentVault(result.path, result.name);
        onWorldReady();
      } catch (error) {
        console.error("Failed to start starter pack:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not start this starter pack.",
        );
      } finally {
        setIsBusy(false);
      }
    },
    [
      onWorldReady,
      openWorld,
      refreshWorlds,
      setCurrentVault,
      settings?.worldnoteRoot,
    ],
  );

  const handleImportWorld = useCallback(async () => {
    if (!settings?.worldnoteRoot) {
      return;
    }
    setIsBusy(true);
    try {
      const archivePath = await pickWorldArchiveFile();
      if (!archivePath) {
        return;
      }
      const imported = await importWorld(settings.worldnoteRoot, archivePath);
      await refreshWorlds();
      toast.success(`"${imported.name}" imported`);
    } catch (error) {
      console.error("Failed to import world:", error);
      toast.error(
        error instanceof Error ? error.message : "Could not import this world.",
      );
    } finally {
      setIsBusy(false);
    }
  }, [refreshWorlds, settings?.worldnoteRoot]);

  const handleOpenRootFolder = useCallback(async () => {
    if (!settings?.worldnoteRoot) {
      return;
    }
    try {
      await revealItemInDir(settings.worldnoteRoot);
    } catch (error) {
      console.error("Failed to open WorldNote folder:", error);
    }
  }, [settings?.worldnoteRoot]);

  const username = settings?.username ?? "there";
  const greeting = getTimeOfDayGreeting();

  return (
    <div className={pageShellClassName}>
      <div aria-hidden className={pageBackdropClassName} />
      <HomeHeader
        username={username}
        onOpenSettings={onOpenSettings ?? (() => {})}
      />

      <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden px-[46px] pb-6 pt-10">
        <HomeHero greeting={greeting} username={username} />

        <WorldsSection
          isBusy={isBusy}
          isLoading={isLoadingWorlds}
          worlds={displayWorlds}
          pinnedCount={pinnedWorlds.length}
          pinnedPaths={pinnedPaths}
          onCreate={() => setIsCreateOpen(true)}
          onImportWorld={() => {
            void handleImportWorld();
          }}
          onTrySampleWorld={() => {
            void handleTrySampleWorld();
          }}
          onOpenRoot={() => {
            void handleOpenRootFolder();
          }}
          onOpenVault={() => onOpenVault?.()}
          onOpenWorld={(world) => {
            void handleOpenWorld(world);
          }}
          onManageWorld={setManageWorld}
          onTogglePin={(world) => {
            void handleTogglePin(world);
          }}
          onStartStarterPack={(pack) => {
            void handleStartStarterPack(pack);
          }}
        />
      </main>

      <CreateWorldModal
        isOpen={isCreateOpen}
        forcedRoot={settings?.worldnoteRoot}
        onClose={() => setIsCreateOpen(false)}
        onWorldReady={() => {
          void refreshWorlds();
          onWorldReady();
        }}
      />

      <WorldSettingsModal
        world={manageWorld}
        isOpen={manageWorld !== null}
        onClose={() => setManageWorld(null)}
        onWorldRenamed={(oldPath, newPath) => {
          void handleWorldRenamed(oldPath, newPath);
        }}
        onWorldDeleted={(path) => {
          void handleWorldDeleted(path);
        }}
        onWorldsChanged={() => {
          void refreshWorlds();
        }}
      />
    </div>
  );
}
