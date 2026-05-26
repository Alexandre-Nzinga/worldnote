import { screenFade } from "@worldnote/ui";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Canvas } from "./components/Canvas/index.js";
import { Launcher } from "./components/Launcher/index.js";
import { LoadingScreen } from "./components/LoadingScreen.js";
import { Onboarding } from "./components/Onboarding/index.js";
import { Settings } from "./components/Settings/Settings.js";
import {
  isOnboardingComplete,
  useSettings,
} from "./hooks/useSettings.js";

type LauncherView = "launcher" | "canvas" | "settings";

export default function App() {
  const status = useSettings((state) => state.status);
  const settings = useSettings((state) => state.settings);
  const load = useSettings((state) => state.load);
  const [view, setView] = useState<LauncherView>("launcher");

  useEffect(() => {
    void load();
  }, [load]);

  const onWorldReady = useCallback(() => setView("canvas"), []);
  const onBackToLauncher = useCallback(() => setView("launcher"), []);
  const onOpenSettings = useCallback(() => setView("settings"), []);

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (!isOnboardingComplete(settings)) {
    return (
      <Onboarding
        onComplete={() => {
          setView("launcher");
        }}
      />
    );
  }

  return (
    <AnimatePresence mode="wait">
      {view === "canvas" ? (
        <motion.div
          key="canvas"
          className="min-h-screen"
          variants={screenFade}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Canvas onBack={onBackToLauncher} />
        </motion.div>
      ) : view === "settings" ? (
        <motion.div
          key="settings"
          className="min-h-screen"
          variants={screenFade}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Settings onBack={onBackToLauncher} />
        </motion.div>
      ) : (
        <motion.div
          key="launcher"
          className="min-h-screen"
          variants={screenFade}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Launcher onWorldReady={onWorldReady} onOpenSettings={onOpenSettings} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
