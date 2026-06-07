import { useLayoutEffect, type ReactNode } from "react";
import { useSettings } from "../hooks/useSettings.js";
import {
  applyPrimaryColorToDocument,
  normalizePrimaryColor,
  PRIMARY_COLOR_RUNTIME_CLASSES,
} from "../services/settings/primaryColorSettings.js";

/** Sync `html.dark` for Tailwind/HeroUI tokens. */
function applyDarkThemeClass() {
  const root = document.documentElement;
  root.classList.remove("light");
  root.classList.add("dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const settingsStatus = useSettings((state) => state.status);
  const primaryColor = useSettings((state) => state.settings?.primaryColor);

  useLayoutEffect(() => {
    applyDarkThemeClass();
    if (settingsStatus !== "ready") {
      return;
    }
    applyPrimaryColorToDocument(normalizePrimaryColor(primaryColor));
  }, [primaryColor, settingsStatus]);

  return (
    <>
      <div aria-hidden className={`hidden ${PRIMARY_COLOR_RUNTIME_CLASSES}`} />
      {children}
    </>
  );
}
