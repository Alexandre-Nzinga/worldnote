import { screenFade } from "@worldnote/ui";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Canvas } from "./components/Canvas/index.js";
import { Home } from "./components/Home/index.js";
import { LoadingScreen } from "./components/LoadingScreen.js";
import { Onboarding } from "./components/Onboarding/index.js";
import { Settings } from "./components/Settings/Settings.js";
import { Vault } from "./components/Vault/index.js";
import {
  isOnboardingComplete,
  useSettings,
} from "./hooks/useSettings.js";
import { useVault } from "./hooks/useVault.js";

type AppView = "home" | "canvas" | "settings" | "vault";
type VaultReturnView = "home" | "canvas";

export default function App() {
  const status = useSettings((state) => state.status);
  const settings = useSettings((state) => state.settings);
  const load = useSettings((state) => state.load);
  const [view, setView] = useState<AppView>("home");
  const [vaultReturnTo, setVaultReturnTo] = useState<VaultReturnView>("home");
  const currentVaultPath = useVault((state) => state.currentVaultPath);

  useEffect(() => {
    void load();
  }, [load]);

  const onWorldReady = useCallback(() => setView("canvas"), []);
  const onBackToHome = useCallback(() => setView("home"), []);
  const onOpenSettings = useCallback(() => setView("settings"), []);
  const onOpenVault = useCallback((from: VaultReturnView) => {
    setVaultReturnTo(from);
    setView("vault");
  }, []);
  const onBackFromVault = useCallback(() => {
    setView(vaultReturnTo);
  }, [vaultReturnTo]);

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

  return (
    <div className="h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {view === "canvas" ? (
          <motion.div
            key="canvas"
            className="h-screen overflow-hidden"
            variants={screenFade}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Canvas
              onBack={onBackToHome}
              onOpenVault={() => onOpenVault("canvas")}
            />
          </motion.div>
        ) : view === "settings" ? (
          <motion.div
            key="settings"
            className="h-screen overflow-hidden"
            variants={screenFade}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Settings onBack={onBackToHome} />
          </motion.div>
        ) : view === "vault" ? (
          <motion.div
            key="vault"
            className="h-screen overflow-hidden"
            variants={screenFade}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Vault
              onBack={onBackFromVault}
              worldnoteRoot={settings?.worldnoteRoot ?? ""}
              currentWorldPath={
                vaultReturnTo === "canvas" ? (currentVaultPath ?? undefined) : undefined
              }
            />
          </motion.div>
        ) : (
          <motion.div
            key="home"
            className="h-screen overflow-hidden"
            variants={screenFade}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Home
              onWorldReady={onWorldReady}
              onOpenSettings={onOpenSettings}
              onOpenVault={() => onOpenVault("home")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
