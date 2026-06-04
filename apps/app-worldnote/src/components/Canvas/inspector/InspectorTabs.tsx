import { stepTransition } from "@worldnote/ui";
import { motion } from "framer-motion";

export type InspectorTabId = "info" | "properties";

const TABS: Array<{ id: InspectorTabId; label: string }> = [
  { id: "info", label: "Info" },
  { id: "properties", label: "Properties" },
];

type InspectorTabsProps = {
  activeTab: InspectorTabId;
  onTabChange: (tab: InspectorTabId) => void;
};

export function InspectorTabs({ activeTab, onTabChange }: InspectorTabsProps) {
  return (
    <div
      className="flex w-full gap-1 rounded-lg bg-wn-mono-950 p-1"
      role="tablist"
      aria-label="Inspector sections"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={
              isActive
                ? "relative flex-1 rounded-md px-3 py-2 text-sm font-medium text-wn-mono-50"
                : "relative flex-1 rounded-md px-3 py-2 text-sm font-medium text-wn-mono-500 transition-colors hover:text-wn-mono-300"
            }
            onClick={() => onTabChange(tab.id)}
          >
            {isActive ? (
              <motion.span
                layoutId="inspector-tab-pill"
                className="absolute inset-0 rounded-md bg-wn-mono-800 shadow-sm"
                transition={stepTransition}
              />
            ) : null}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
