import { revealItemInDir } from "@tauri-apps/plugin-opener";
import {
  Button,
  MaterialSymbol,
  WorldNoteLogo,
  getBodyTextStyle,
  getHeadingStyle,
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
import {
  listWorlds,
  type WorldSummary,
} from "../../services/worlds/listWorlds.js";
import { getTimeOfDayGreeting } from "./worldCover.js";
import { WorldCard } from "./WorldCard.js";
import { WorldSettingsModal } from "./WorldSettingsModal.js";
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

  const [worlds, setWorlds] = useState<WorldSummary[]>([]);
  const [isLoadingWorlds, setIsLoadingWorlds] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [manageWorld, setManageWorld] = useState<WorldSummary | null>(null);
  const [pinMessage, setPinMessage] = useState<string | null>(null);

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

  const handleOpenWorld = useCallback(
    async (world: WorldSummary) => {
      setIsBusy(true);
      try {
        await openWorld(world.path);
        setCurrentVault(world.path, world.name);
        onWorldReady();
      } catch (error) {
        console.error("Failed to open world:", error);
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
        setPinMessage(result.error);
        return;
      }
      setPinMessage(null);
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
    <div className="relative flex h-screen flex-col overflow-hidden bg-wn-mono-950 text-wn-mono-100">
      <HomeHeader
        username={username}
        onOpenSettings={onOpenSettings ?? (() => {})}
      />

      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-[46px] pb-6 pt-10">
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
          pinMessage={pinMessage}
          onDismissPinMessage={() => setPinMessage(null)}
          onCreate={() => setIsCreateOpen(true)}
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
  return (
    <header className="relative flex shrink-0 items-center justify-between px-[46px] pt-7">
      <div className="flex items-center gap-3">
        <WorldNoteLogo
          variant="icon"
          tone="white"
          className="h-7 w-7 opacity-90"
          alt="WorldNote"
        />
        <span
          className="text-wn-mono-50"
          style={{
            ...getBodyTextStyle("small"),
            fontSize: "24px",
            fontWeight: "var(--font-weight-wn-semibold)",
          }}
        >
          WorldNote
        </span>
      </div>
      <ProfileMenu username={username} onOpenSettings={onOpenSettings} />
    </header>
  );
}

function HeroTitle() {
  return (
    <h1
      className="mx-auto mb-10 max-w-[648px] shrink-0 text-center leading-tight text-wn-mono-50"
      style={{
        ...getHeadingStyle("h1"),
        fontSize: "48px",
        fontWeight: "var(--font-weight-wn-semibold)",
        color: "var(--color-wn-mono-50)",
      }}
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
  pinMessage: string | null;
  onDismissPinMessage: () => void;
  onCreate: () => void;
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
  pinMessage,
  onDismissPinMessage,
  onCreate,
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
        <h2
          className="text-wn-mono-50"
          style={{
            fontSize: "20px",
            fontWeight: "var(--font-weight-wn-medium)",
          }}
        >
          Your Worlds
        </h2>
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
        {pinMessage ? (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-wn-amber-500/30 bg-wn-amber-950/40 px-3 py-2 text-wn-amber-100">
            <span className="text-wn-small">{pinMessage}</span>
            <button
              type="button"
              className="shrink-0 rounded-full px-2 py-0.5 text-wn-amber-200 hover:bg-wn-amber-900/50"
              onClick={onDismissPinMessage}
              aria-label="Dismiss"
            >
              <MaterialSymbol name="close" className="text-base" />
            </button>
          </div>
        ) : null}
        {isLoading ? (
          <div className="flex h-[270px] items-center justify-center rounded-wn-card border border-wn-mono-800 bg-wn-mono-950/20 text-wn-mono-500">
            Loading worlds…
          </div>
        ) : worlds.length > 0 ? (
          <WorldsGrid
            worlds={worlds}
            pinnedCount={pinnedCount}
            pinnedSet={pinnedSet}
            canPinMore={canPinMore}
            isBusy={isBusy}
            pinMessage={pinMessage}
            onOpenWorld={onOpenWorld}
            onManageWorld={onManageWorld}
            onTogglePin={onTogglePin}
          />
        ) : (
          <EmptyWorldsState disabled={isBusy} onCreate={onCreate} />
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
  pinMessage: string | null;
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
  pinMessage,
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
        pinError={pinMessage && !pinnedSet.has(world.path) ? pinMessage : null}
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
  disabled?: boolean;
};

function EmptyWorldsState({ onCreate, disabled }: EmptyWorldsStateProps) {
  return (
    <div
      className="flex h-[270px] flex-col items-center justify-center gap-4 rounded-wn-card border border-dashed border-wn-mono-800 bg-wn-mono-950/20"
      style={{ borderRadius: "var(--radius-wn-card)" }}
    >
      <p
        className="text-wn-mono-400"
        style={{
          fontSize: "20px",
          fontWeight: "var(--font-weight-wn-medium)",
        }}
      >
        No worlds yet
      </p>
      <Button variant="white" size="sm" isDisabled={disabled} onPress={onCreate}>
        Create your first world
      </Button>
    </div>
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
