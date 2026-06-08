import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Canvas } from "./components/Canvas/index.js";
import { Home } from "./components/Home/index.js";
import { HelpButton } from "./components/shell/HelpButton.js";
import { LoadingScreen } from "./components/LoadingScreen.js";
import { Onboarding } from "./components/Onboarding/index.js";
import { Settings } from "./components/Settings/Settings.js";
import { Vault } from "./components/Vault/index.js";
import { TutorialOverlay } from "./components/Tutorial/index.js";
import { isOnboardingComplete, useSettings } from "./hooks/useSettings.js";
import { useTutorial } from "./hooks/useTutorial.js";
import { useVaultCommands } from "./hooks/useVaultCommands.js";
import { useVault } from "./hooks/useVault.js";
import { openSampleWorld } from "./services/starterPacks/index.js";
import { openTutorialWorld } from "./services/tutorialWorld/openTutorialWorld.js";
import { toast } from "./services/notifications/toast.js";

type AppView = "home" | "canvas" | "settings" | "vault";
type VaultReturnView = "home" | "canvas";
type SettingsReturnView = "home" | "canvas";

const overlayMotionClassName = "absolute inset-0 z-20 h-screen overflow-hidden";

/** Active base views sit above a fading overlay so return navigation stays interactive. */
const ACTIVE_BASE_Z_INDEX = 25;

/** Fade only — release pointer events immediately on exit to avoid a frozen UI. */
const overlayScreenFade: Variants = {
  hidden: { opacity: 0, pointerEvents: "none" },
  visible: {
    opacity: 1,
    pointerEvents: "auto",
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    pointerEvents: "none",
    transition: { duration: 0.12 },
  },
};

type BaseLayerProps = {
  active: boolean;
  children: ReactNode;
};

/** Keep base views fully opaque — hide with `hidden` so inactive Canvas stops painting. */
function BaseLayer({ active, children }: BaseLayerProps) {
  return (
    <div
      className={
        active
          ? "absolute inset-0 h-screen overflow-hidden"
          : "absolute inset-0 hidden h-screen overflow-hidden"
      }
      style={{
        zIndex: active ? ACTIVE_BASE_Z_INDEX : 0,
      }}
      aria-hidden={!active}
    >
      {children}
    </div>
  );
}

export default function App() {
  const status = useSettings((state) => state.status);
  const settings = useSettings((state) => state.settings);
  const load = useSettings((state) => state.load);
  const saveSettings = useSettings((state) => state.save);
  const [view, setView] = useState<AppView>("home");
  const [canvasEverOpened, setCanvasEverOpened] = useState(false);
  const [vaultReturnTo, setVaultReturnTo] = useState<VaultReturnView>("home");
  const [settingsReturnTo, setSettingsReturnTo] =
    useState<SettingsReturnView>("home");
  const [isOpeningTutorial, setIsOpeningTutorial] = useState(false);
  const currentVaultPath = useVault((state) => state.currentVaultPath);
  const setCurrentVault = useVault((state) => state.setCurrentVault);
  const requestStarterAction = useVault((state) => state.requestStarterAction);
  const { openWorld } = useVaultCommands();
  const tutorialActive = useTutorial((state) => state.isActive);
  const tutorialNeedsWorld = useTutorial((state) => state.needsWorldOpen);
  const activateTutorial = useTutorial((state) => state.activate);
  const startTutorial = useTutorial((state) => state.start);
  const completeTutorial = useTutorial((state) => state.complete);

  useEffect(() => {
    void load();
  }, [load]);

  const persistTutorialFinished = useCallback(async () => {
    if (!settings) {
      completeTutorial();
      return;
    }
    await saveSettings({
      ...settings,
      tutorialCompletedAt: Date.now(),
    });
    completeTutorial();
  }, [completeTutorial, saveSettings, settings]);

  useEffect(() => {
    if (!tutorialActive || !tutorialNeedsWorld || !settings?.worldnoteRoot) {
      return;
    }

    let cancelled = false;
    setIsOpeningTutorial(true);

    void (async () => {
      try {
        const tutorialWorld = await openTutorialWorld(settings.worldnoteRoot);
        if (cancelled) {
          return;
        }
        await openWorld(tutorialWorld.path);
        setCurrentVault(tutorialWorld.path, tutorialWorld.name);
        activateTutorial({
          cardAnchorMap: tutorialWorld.cardAnchorMap,
          stickyNoteAnchorMap: tutorialWorld.stickyNoteAnchorMap,
          canvasImageAnchorMap: tutorialWorld.canvasImageAnchorMap,
        });
        setCanvasEverOpened(true);
        setView("canvas");
      } catch (error) {
        console.error("Failed to open tutorial world:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not start the tutorial.",
        );
        completeTutorial();
      } finally {
        if (!cancelled) {
          setIsOpeningTutorial(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    activateTutorial,
    completeTutorial,
    openWorld,
    setCurrentVault,
    settings?.worldnoteRoot,
    tutorialActive,
    tutorialNeedsWorld,
  ]);

  const onWorldReady = useCallback(() => {
    setCanvasEverOpened(true);
    setView("canvas");
  }, []);
  const onBackToHome = useCallback(() => setView("home"), []);
  const onOpenSettings = useCallback((from: SettingsReturnView = "home") => {
    setSettingsReturnTo(from);
    setView("settings");
  }, []);
  const onBackFromSettings = useCallback(() => {
    setView(settingsReturnTo);
  }, [settingsReturnTo]);
  const onOpenVault = useCallback((from: VaultReturnView) => {
    setVaultReturnTo(from);
    setView("vault");
  }, []);
  const onBackFromVault = useCallback(() => {
    setView(vaultReturnTo);
  }, [vaultReturnTo]);

  const handleStartTutorialFromSettings = useCallback(() => {
    setView("home");
    startTutorial("settings");
  }, [startTutorial]);

  const handleTrySampleWorld = useCallback(async () => {
    const root = settings?.worldnoteRoot;
    if (!root) {
      return;
    }
    try {
      const sample = await openSampleWorld(root);
      await openWorld(sample.path);
      setCurrentVault(sample.path, sample.name);
      setCanvasEverOpened(true);
      setView("canvas");
    } catch (error) {
      console.error("Failed to open sample world:", error);
    }
  }, [openWorld, setCurrentVault, settings?.worldnoteRoot]);

  const handleVaultCreateWorld = useCallback(() => {
    requestStarterAction("create-world");
    onBackFromVault();
  }, [onBackFromVault, requestStarterAction]);

  const handleVaultAddCharacter = useCallback(() => {
    requestStarterAction("add-character");
    onBackFromVault();
  }, [onBackFromVault, requestStarterAction]);

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (!isOnboardingComplete(settings)) {
    return (
      <Onboarding
        onComplete={() => {
          setView("home");
        }}
      />
    );
  }

  const isHomeActive = view === "home";
  const isCanvasActive = view === "canvas";
  const showHelpButton =
    (view === "home" || view === "settings") && !tutorialActive;

  return (
    <div className="relative h-screen overflow-hidden bg-wn-bg">
      <BaseLayer active={isHomeActive}>
        <Home
          onWorldReady={onWorldReady}
          onOpenSettings={() => onOpenSettings("home")}
          onOpenVault={() => onOpenVault("home")}
          isTutorialOpening={isOpeningTutorial}
        />
      </BaseLayer>

      {canvasEverOpened ? (
        <BaseLayer active={isCanvasActive}>
          <Canvas
            onBack={onBackToHome}
            onOpenVault={() => onOpenVault("canvas")}
            onOpenSettings={() => onOpenSettings("canvas")}
          />
        </BaseLayer>
      ) : null}

      <AnimatePresence initial={false}>
        {view === "settings" ? (
          <motion.div
            key="settings"
            className={overlayMotionClassName}
            variants={overlayScreenFade}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Settings
              onBack={onBackFromSettings}
              onStartTutorial={handleStartTutorialFromSettings}
              currentWorldPath={
                settingsReturnTo === "canvas"
                  ? (currentVaultPath ?? undefined)
                  : undefined
              }
            />
          </motion.div>
        ) : null}
        {view === "vault" ? (
          <motion.div
            key="vault"
            className={overlayMotionClassName}
            variants={overlayScreenFade}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Vault
              onBack={onBackFromVault}
              worldnoteRoot={settings?.worldnoteRoot ?? ""}
              currentWorldPath={
                vaultReturnTo === "canvas"
                  ? (currentVaultPath ?? undefined)
                  : undefined
              }
              onCreateWorld={handleVaultCreateWorld}
              onTrySampleWorld={() => {
                void handleTrySampleWorld();
              }}
              onAddCharacter={
                vaultReturnTo === "canvas" && currentVaultPath
                  ? handleVaultAddCharacter
                  : undefined
              }
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <TutorialOverlay
        onFinished={() => {
          void persistTutorialFinished();
        }}
      />

      {showHelpButton ? <HelpButton /> : null}
    </div>
  );
}
