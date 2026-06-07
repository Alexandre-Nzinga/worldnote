import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { useSettings } from "../hooks/useSettings.js";
import {
  applyPrimaryColorToDocument,
  normalizePrimaryColor,
} from "../services/settings/primaryColorSettings.js";
import type { ThemePreference } from "../services/settings/settings.js";

export type ResolvedTheme = "light" | "dark";

/** Mirrors the saved preference so the index.html boot script avoids a flash. */
export const THEME_STORAGE_KEY = "wn-theme";

const ThemeContext = createContext<ResolvedTheme>("dark");

/** Resolved (concrete) theme, with "system" already collapsed to light/dark. */
export function useResolvedTheme(): ResolvedTheme {
  return useContext(ThemeContext);
}

function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function resolveTheme(
  preference: ThemePreference,
  systemDark: boolean,
): ResolvedTheme {
  if (preference === "system") {
    return systemDark ? "dark" : "light";
  }
  return preference;
}

function readStoredThemePreference(): ThemePreference | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // Storage may be unavailable.
  }
  return null;
}

function resolveThemePreference(
  saved: ThemePreference | undefined,
): ThemePreference {
  return saved ?? readStoredThemePreference() ?? "system";
}

/** Sync `html` class for Tailwind/HeroUI theme tokens and the boot script. */
export function applyThemeClass(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(resolved);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const savedTheme = useSettings((state) => state.settings?.theme);
  const preference = resolveThemePreference(savedTheme);
  const primaryColor = useSettings((state) => state.settings?.primaryColor);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      setSystemDark(event.matches);
    };
    mediaQuery.addEventListener("change", onChange);
    return () => {
      mediaQuery.removeEventListener("change", onChange);
    };
  }, []);

  const resolved = resolveTheme(preference, systemDark);

  useLayoutEffect(() => {
    applyThemeClass(resolved);
  }, [resolved]);

  useEffect(() => {
    applyPrimaryColorToDocument(normalizePrimaryColor(primaryColor));
  }, [primaryColor]);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // Storage may be unavailable; the boot script falls back to dark.
    }
  }, [preference]);

  return (
    <ThemeContext.Provider value={resolved}>{children}</ThemeContext.Provider>
  );
}
