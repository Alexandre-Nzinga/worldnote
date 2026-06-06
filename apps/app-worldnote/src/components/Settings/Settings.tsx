import { Input } from "@heroui/react";
import {
  Button,
  MaterialSymbol,
  type StepDirection,
  stepTransitionVariants,
  usePrefersReducedMotion,
  WorldNoteLogo,
  fieldLabelClassName,
  fieldStackClassName,
  getBodyTextStyle,
  getHeadingProps,
} from "@worldnote/ui";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSettings } from "../../hooks/useSettings.js";
import {
  normalizeCanvasKeyboardShortcuts,
  type CanvasKeyboardShortcuts,
} from "../../services/settings/keyboardShortcuts.js";
import { normalizeCardTypeBadgeOverrides } from "../../services/settings/cardTypeBadgeSettings.js";
import { normalizeVisibleSocketsSettings } from "../../services/settings/visibleSocketSettings.js";
import { normalizeWizardSettings } from "../../services/settings/wizardSettings.js";
import { CardTypeBadgeSettings } from "./CardTypeBadgeSettings.js";
import { useResolvedTheme } from "../../theme/ThemeProvider.js";
import { KeyboardShortcutsSettings } from "./KeyboardShortcutsSettings.js";
import { SocketVisibilitySettings } from "./SocketVisibilitySettings.js";
import {
  SETTINGS_SECTION_ORDER,
  SettingsSidebar,
  settingsSectionMeta,
  type SettingsSection,
} from "./SettingsSidebar.js";
import { PrimaryColorSetting } from "./PrimaryColorSetting.js";
import { ThemeSetting } from "./ThemeSetting.js";
import { UnitSystemSetting } from "./UnitSystemSetting.js";
import { WorldWizardSettings } from "./WorldWizardSettings.js";
import { modalPrimaryButtonClassName } from "../Onboarding/fieldClassNames.js";
import {
  settingsFieldInputClassNames,
  settingsPageBackdropClassName,
  settingsPageClassName,
  settingsPanelClassName,
  settingsReadOnlyValueClassName,
} from "./settingsStyles.js";

type SettingsProps = {
  onBack: () => void;
};

const settingsSectionFadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Tween avoids spring bounce jitter on tall settings panels. */
const settingsSectionTransition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function Settings({ onBack }: SettingsProps) {
  const settings = useSettings((state) => state.settings);
  const save = useSettings((state) => state.save);
  const theme = useResolvedTheme();

  const reducedMotion = usePrefersReducedMotion();
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const [direction, setDirection] = useState<StepDirection>(1);
  const sectionIndexRef = useRef(
    SETTINGS_SECTION_ORDER.indexOf("profile"),
  );
  const [username, setUsername] = useState("");
  const [visibleSockets, setVisibleSockets] = useState(
    normalizeVisibleSocketsSettings(undefined),
  );
  const [cardTypeBadgeColors, setCardTypeBadgeColors] = useState(
    normalizeCardTypeBadgeOverrides(undefined),
  );
  const [canvasShortcuts, setCanvasShortcuts] =
    useState<CanvasKeyboardShortcuts>(
      normalizeCanvasKeyboardShortcuts(undefined),
    );
  const [wizardSettings, setWizardSettings] = useState(
    normalizeWizardSettings(undefined),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sectionMeta = settingsSectionMeta(activeSection);

  const goToSection = useCallback((next: SettingsSection) => {
    const nextIndex = SETTINGS_SECTION_ORDER.indexOf(next);
    setDirection(nextIndex >= sectionIndexRef.current ? 1 : -1);
    sectionIndexRef.current = nextIndex;
    setActiveSection(next);
  }, []);

  const renderSectionContent = useCallback(() => {
    if (!settings) {
      return null;
    }

    switch (activeSection) {
      case "profile":
        return (
          <section className={`${settingsPanelClassName} flex flex-col gap-5`}>
            <div className={fieldStackClassName}>
              <label htmlFor="settings-username" className={fieldLabelClassName}>
                Username <span className="text-wn-red-500">*</span>
              </label>
              <Input
                id="settings-username"
                autoFocus
                isRequired
                aria-label="Username"
                value={username}
                onValueChange={setUsername}
                classNames={settingsFieldInputClassNames}
              />
            </div>

            <div className={fieldStackClassName}>
              <span className={fieldLabelClassName}>WorldNote folder</span>
              <p className={settingsReadOnlyValueClassName}>
                {settings.worldnoteRoot}
              </p>
            </div>
          </section>
        );
      case "measurements":
        return <UnitSystemSetting disabled={isSaving} />;
      case "appearance":
        return (
          <div className="flex flex-col gap-6">
            <ThemeSetting disabled={isSaving} />
            <PrimaryColorSetting disabled={isSaving} />
          </div>
        );
      case "canvas":
        return (
          <div className="flex flex-col gap-8">
            <SocketVisibilitySettings
              value={visibleSockets}
              onChange={setVisibleSockets}
              disabled={isSaving}
            />
            <CardTypeBadgeSettings
              value={cardTypeBadgeColors}
              onChange={setCardTypeBadgeColors}
              disabled={isSaving}
            />
          </div>
        );
      case "wizard":
        return (
          <WorldWizardSettings
            value={wizardSettings}
            onChange={setWizardSettings}
            disabled={isSaving}
          />
        );
      case "shortcuts":
        return (
          <KeyboardShortcutsSettings
            value={canvasShortcuts}
            onChange={setCanvasShortcuts}
            disabled={isSaving}
            showHeading={false}
          />
        );
      default:
        return null;
    }
  }, [
    activeSection,
    canvasShortcuts,
    cardTypeBadgeColors,
    isSaving,
    settings,
    username,
    visibleSockets,
    wizardSettings,
  ]);

  useEffect(() => {
    if (!settings) {
      return;
    }
    setUsername(settings.username);
    setVisibleSockets(
      normalizeVisibleSocketsSettings(settings.visibleSockets),
    );
    setCardTypeBadgeColors(
      normalizeCardTypeBadgeOverrides(settings.cardTypeBadgeColors),
    );
    setCanvasShortcuts(
      normalizeCanvasKeyboardShortcuts(settings.canvasShortcuts),
    );
    setWizardSettings(normalizeWizardSettings(settings.wizard));
    setError(null);
    setIsSaving(false);
  }, [settings]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) {
        onBack();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isSaving, onBack]);

  const handleSave = useCallback(async () => {
    if (!settings || !username.trim()) {
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await save({
        ...settings,
        username: username.trim(),
        visibleSockets,
        cardTypeBadgeColors,
        canvasShortcuts,
        wizard: wizardSettings,
      });
      onBack();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : String(saveError),
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    canvasShortcuts,
    cardTypeBadgeColors,
    onBack,
    save,
    settings,
    username,
    visibleSockets,
    wizardSettings,
  ]);

  const canSave = username.trim().length > 0 && !isSaving;

  if (!settings) {
    return (
      <div className="flex h-screen items-center justify-center bg-wn-mono-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <WorldNoteLogo
            variant="icon"
            tone={theme === "dark" ? "white" : "black"}
            className="h-12 w-12 opacity-60"
            alt="Loading"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className={settingsPageClassName}>
      <div aria-hidden className={settingsPageBackdropClassName} />
      <header className="relative z-10 flex shrink-0 items-center justify-between px-[46px] py-5">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            onPress={onBack}
            aria-label="Back to home"
            className="min-w-0 border-0 bg-transparent px-2 text-wn-mono-400 shadow-none hover:bg-transparent hover:text-wn-mono-50 data-[hover=true]:bg-transparent data-[hover=true]:text-wn-mono-50"
          >
            <MaterialSymbol name="arrow_back" className="text-lg" />
          </Button>
          <h2 {...getHeadingProps("h3", { tone: "inverse" })}>Settings</h2>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1">
        <div className="shrink-0 pl-[46px]">
          <SettingsSidebar
            activeSection={activeSection}
            onSectionChange={goToSection}
          />
        </div>

        <main className="scrollbar-wn relative z-10 min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-8 pt-6 pb-20">
          <div className="relative w-full">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeSection}
                custom={direction}
                variants={
                  reducedMotion
                    ? settingsSectionFadeVariants
                    : stepTransitionVariants
                }
                initial="enter"
                animate="center"
                exit="exit"
                transition={
                  reducedMotion
                    ? { duration: 0.15 }
                    : settingsSectionTransition
                }
                className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-8"
              >
              <div className="flex flex-col gap-1">
                <h1 {...getHeadingProps("h2", { tone: "inverse" })}>
                  {sectionMeta.label}
                </h1>
                <p style={getBodyTextStyle("small")}>
                  {sectionMeta.description}
                </p>
              </div>

              {renderSectionContent()}

              {error ? (
                <p className="text-sm text-wn-red-400" role="alert">
                  {error}
                </p>
              ) : null}

              <footer className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  size="base"
                  isDisabled={isSaving}
                  onPress={onBack}
                >
                  Cancel
                </Button>
                <Button
                  variant="white"
                  size="base"
                  className={modalPrimaryButtonClassName}
                  isDisabled={!canSave}
                  onPress={() => {
                    void handleSave();
                  }}
                >
                  Save
                </Button>
              </footer>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
