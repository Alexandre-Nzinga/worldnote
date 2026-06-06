import { revealItemInDir } from "@tauri-apps/plugin-opener";
import {
  Button,
  MaterialSymbol,
  WorldNoteLogo,
  getBodyTextStyle,
  getHeadingProps,
  springSnappy,
} from "@worldnote/ui";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CreateWorldModal } from "../CreateWorldModal.js";
import { ProfileMenu } from "./ProfileMenu.js";
import { useSettings } from "../../hooks/useSettings.js";
import { useVault } from "../../hooks/useVault.js";
import { useVaultCommands } from "../../hooks/useVaultCommands.js";
import {
  getPinnedWorldPaths,
  MAX_PINNED_WORLDS,
  normalizePinnedWorldPaths,
  partitionWorldsByPinned,
  remapPinnedWorldPath,
  removePinnedWorldPath,
  togglePinnedWorldPath,
} from "../../services/settings/pinnedWorlds.js";
import { createSampleWorld } from "../../services/worlds/createSampleWorld.js";
import {
  listWorlds,
  type WorldSummary,
} from "../../services/worlds/listWorlds.js";
import { RichEmptyState } from "../ui/RichEmptyState.js";
import { useResolvedTheme } from "../../theme/ThemeProvider.js";
import { getTimeOfDayGreeting } from "./worldCover.js";
import {
  pageBackdropClassName,
  pageShellClassName,
} from "../shell/pageShellStyles.js";
import { WorldCard } from "./WorldCard.js";
import { WorldCardSkeletonGrid } from "./WorldCardSkeleton.js";
import { WorldSettingsModal } from "./WorldSettingsModal.js";
import { toast } from "../../services/notifications/toast.js";
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

  const pinnedPaths = useMemo(
    () => getPinnedWorldPaths(settings),
    [settings],
  );

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
      await persistPinnedPaths(remapPinnedWorldPath(pinnedPaths, oldPath, newPath));
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
      const sample = await createSampleWorld(settings.worldnoteRoot);
      await openWorld(sample.path);
      setCurrentVault(sample.path, sample.name);
      onWorldReady();
    } catch (error) {
      console.error("Failed to create sample world:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not create the sample world.",
      );
    } finally {
      setIsBusy(false);
    }
  }, [
    onWorldReady,
    openWorld,
    setCurrentVault,
    settings?.worldnoteRoot,
  ]);

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
        <p
          className="mb-2 shrink-0 text-center text-wn-mono-400"
          style={{
            ...getBodyTextStyle("body"),
            fontSize: "20px",
            fontWeight: "var(--font-weight-wn-medium)",
          }}
        >
          Good {greeting}, {username}
        </p>
        <HeroTitle />

        <WorldsSection
          isBusy={isBusy}
          isLoading={isLoadingWorlds}
          worlds={displayWorlds}
          pinnedCount={pinnedWorlds.length}
          pinnedPaths={pinnedPaths}
          onCreate={() => setIsCreateOpen(true)}
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

function HomeHeader({
  username,
  onOpenSettings,
}: {
  username: string;
  onOpenSettings: () => void;
}) {
  const theme = useResolvedTheme();
  return (
    <header className="relative z-10 flex shrink-0 items-center justify-between px-[46px] pt-7">
      <div className="flex items-center gap-3">
        <WorldNoteLogo
          variant="icon"
          tone={theme === "dark" ? "white" : "black"}
          className="h-7 w-7 opacity-90"
          alt="WorldNote"
        />
        <h2 {...getHeadingProps("h3", { tone: "inverse" })}>WorldNote</h2>
      </div>
      <ProfileMenu username={username} onOpenSettings={onOpenSettings} />
    </header>
  );
}

function HeroTitle() {
  return (
    <h1
      {...getHeadingProps("h1", {
        tone: "inverse",
        weight: "semibold",
        className: "mx-auto mb-10 shrink-0 text-center whitespace-nowrap",
      })}
    >
      What are you building today?
    </h1>
  );
}

type WorldsSectionProps = {
  isBusy: boolean;
  isLoading: boolean;
  worlds: WorldSummary[];
  pinnedCount: number;
  pinnedPaths: string[];
  onCreate: () => void;
  onTrySampleWorld: () => void;
  onOpenRoot: () => void;
  onOpenVault: () => void;
  onOpenWorld: (world: WorldSummary) => void;
  onManageWorld: (world: WorldSummary) => void;
  onTogglePin: (world: WorldSummary) => void;
};

function WorldsSection({
  isBusy,
  isLoading,
  worlds,
  pinnedCount,
  pinnedPaths,
  onCreate,
  onTrySampleWorld,
  onOpenRoot,
  onOpenVault,
  onOpenWorld,
  onManageWorld,
  onTogglePin,
}: WorldsSectionProps) {
  const pinnedSet = useMemo(() => new Set(pinnedPaths), [pinnedPaths]);
  const canPinMore = pinnedCount < MAX_PINNED_WORLDS;
  return (
    <section className="mx-auto flex min-h-0 w-full max-w-[1008px] flex-1 flex-col">
      <div className="mb-6 flex shrink-0 items-center justify-between">
        <h2 {...getHeadingProps("h4", { tone: "inverse" })}>Your Worlds</h2>
        <div className="flex items-center gap-6">
          <Button
            variant="secondary"
            size="sm"
            isDisabled={isBusy}
            onPress={onOpenVault}
            startContent={<MaterialSymbol name="layers" className="text-base" />}
          >
            Vault
          </Button>
          <Button
            variant="secondary"
            size="sm"
            isDisabled={isBusy}
            onPress={onOpenRoot}
            startContent={
              <MaterialSymbol name="folder_open" className="text-base" />
            }
          >
            Open folder
          </Button>
          <Button
            variant="white"
            size="sm"
            isDisabled={isBusy}
            onPress={onCreate}
            startContent={<MaterialSymbol name="add" className="text-base" />}
          >
            Create world
          </Button>
        </div>
      </div>

      <div className="scrollbar-wn flex min-h-0 flex-1 flex-col overflow-y-auto pr-2">
        {isLoading ? (
          <WorldCardSkeletonGrid />
        ) : worlds.length > 0 ? (
          <WorldsGrid
            worlds={worlds}
            pinnedCount={pinnedCount}
            pinnedSet={pinnedSet}
            canPinMore={canPinMore}
            isBusy={isBusy}
            onOpenWorld={onOpenWorld}
            onManageWorld={onManageWorld}
            onTogglePin={onTogglePin}
          />
        ) : (
          <EmptyWorldsState
            disabled={isBusy}
            onCreate={onCreate}
            onTrySampleWorld={onTrySampleWorld}
          />
        )}

        <HomeFooter />
      </div>
    </section>
  );
}

type WorldsGridProps = {
  worlds: WorldSummary[];
  pinnedCount: number;
  pinnedSet: Set<string>;
  canPinMore: boolean;
  isBusy: boolean;
  onOpenWorld: (world: WorldSummary) => void;
  onManageWorld: (world: WorldSummary) => void;
  onTogglePin: (world: WorldSummary) => void;
};

const sectionLabelStyle = {
  fontSize: "14px",
  fontWeight: "var(--font-weight-wn-medium)",
} as const;

function WorldsGrid({
  worlds,
  pinnedCount,
  pinnedSet,
  canPinMore,
  isBusy,
  onOpenWorld,
  onManageWorld,
  onTogglePin,
}: WorldsGridProps) {
  const pinned = worlds.slice(0, pinnedCount);
  const unpinned = worlds.slice(pinnedCount);

  const renderCard = (world: WorldSummary, index: number) => (
    <motion.div
      key={world.path}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        ...springSnappy,
        delay: Math.min(index, 5) * 0.04,
      }}
    >
      <WorldCard
        world={world}
        disabled={isBusy}
        isPinned={pinnedSet.has(world.path)}
        canPin={canPinMore || pinnedSet.has(world.path)}
        onTogglePin={onTogglePin}
        onOpen={onOpenWorld}
        onManage={onManageWorld}
      />
    </motion.div>
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {pinnedCount > 0 ? (
        <>
          <p className="col-span-full text-wn-mono-400" style={sectionLabelStyle}>
            Pinned
          </p>
          {pinned.map((world, index) => renderCard(world, index))}
        </>
      ) : null}
      {unpinned.length > 0 && pinnedCount > 0 ? (
        <p
          className="col-span-full mt-2 text-wn-mono-400"
          style={sectionLabelStyle}
        >
          All worlds
        </p>
      ) : null}
      {unpinned.map((world, index) => renderCard(world, pinnedCount + index))}
    </div>
  );
}

type EmptyWorldsStateProps = {
  onCreate: () => void;
  onTrySampleWorld: () => void;
  disabled?: boolean;
};

function EmptyWorldsState({
  onCreate,
  onTrySampleWorld,
  disabled,
}: EmptyWorldsStateProps) {
  return (
    <RichEmptyState
      title="No worlds yet"
      description="Create a world from scratch or explore a ready-made sample with characters, places, and links."
      actions={[
        {
          label: "Create world",
          icon: "add",
          variant: "white",
          onPress: onCreate,
          isDisabled: disabled,
        },
        {
          label: "Try sample world",
          icon: "auto_stories",
          variant: "secondary",
          onPress: onTrySampleWorld,
          isDisabled: disabled,
        },
      ]}
      className="min-h-[270px] justify-center"
    />
  );
}

function HomeFooter() {
  return (
    <footer className="mt-12 flex shrink-0 items-center justify-center pb-4 text-wn-mono-500">
      <div
        className="flex items-center gap-2"
        style={{ fontSize: "13px", fontWeight: "var(--font-weight-wn-medium)" }}
      >
        <span>WorldNote</span>
        <span className="font-mono">v{__APP_VERSION__}</span>
      </div>
    </footer>
  );
}
