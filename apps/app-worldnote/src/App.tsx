import { screenFade } from "@worldnote/ui";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Canvas } from "./components/Canvas/index.js";
import { Launcher } from "./components/Launcher/index.js";
import { Onboarding } from "./components/Onboarding/index.js";
import {
  isOnboardingComplete,
  useSettings,
} from "./hooks/useSettings.js";

type LauncherView = "launcher" | "canvas";

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

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-wn-mono-950 text-wn-mono-400">
        Loading…
      </div>
    );
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
      ) : (
        <motion.div
          key="launcher"
          className="min-h-screen"
          variants={screenFade}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Launcher onWorldReady={onWorldReady} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
