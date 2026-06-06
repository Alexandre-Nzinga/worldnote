import { MaterialSymbol, stepTransition } from "@worldnote/ui";
import { motion } from "framer-motion";

export type SettingsSection =
  | "profile"
  | "measurements"
  | "appearance"
  | "canvas"
  | "modules"
  | "wizard"
  | "shortcuts";

type SettingsNavItem = {
  id: SettingsSection;
  label: string;
  icon: string;
  description: string;
};

export const SETTINGS_SECTIONS: SettingsNavItem[] = [
  {
    id: "profile",
    label: "Profile",
    icon: "person",
    description: "Username and storage location.",
  },
  {
    id: "measurements",
    label: "Measurements",
    icon: "straighten",
    description: "How weight, height, temperature, and other units appear on cards.",
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: "palette",
    description: "Theme and primary accent color for main actions.",
  },
  {
    id: "canvas",
    label: "Canvas",
    icon: "hub",
    description: "Socket visibility and card type badge colors.",
  },
  {
    id: "modules",
    label: "Modules",
    icon: "extension",
    description: "Optional features you can turn on or off.",
  },
  {
    id: "wizard",
    label: "World Wizard",
    icon: "auto_awesome",
    description: "Ollama models and behavior guidelines for the AI wizard.",
  },
  {
    id: "shortcuts",
    label: "Shortcuts",
    icon: "keyboard",
    description: "Canvas copy, paste, and editing shortcuts.",
  },
];

export const SETTINGS_SECTION_ORDER: SettingsSection[] = SETTINGS_SECTIONS.map(
  (section) => section.id,
);

type SettingsSidebarProps = {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
};

export function SettingsSidebar({
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) {
  return (
    <nav
      aria-label="Settings sections"
      className="flex w-52 shrink-0 flex-col gap-1 py-6 pr-6"
    >
      {SETTINGS_SECTIONS.map((section) => {
        const isActive = section.id === activeSection;
        return (
          <button
            key={section.id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onSectionChange(section.id)}
            className={`relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
              isActive
                ? "text-wn-text"
                : "text-wn-text-muted hover:bg-wn-surface/60 hover:text-wn-text"
            }`}
          >
            {isActive ? (
              <motion.span
                layoutId="settings-nav-active"
                className="absolute inset-0 rounded-xl bg-wn-surface shadow-sm"
                transition={stepTransition}
              />
            ) : null}
            <MaterialSymbol
              name={section.icon}
              className={`relative z-10 text-[18px] ${isActive ? "text-wn-text" : "text-wn-text-muted"}`}
            />
            <span className="relative z-10">{section.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function settingsSectionMeta(section: SettingsSection) {
  return SETTINGS_SECTIONS.find((item) => item.id === section) ?? SETTINGS_SECTIONS[0];
}
