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
      className="flex border-b border-wn-mono-800"
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
                ? "flex-1 border-b-2 border-wn-mono-50 px-3 py-2.5 text-sm font-semibold text-wn-mono-50 transition-colors"
                : "flex-1 border-b-2 border-transparent px-3 py-2.5 text-sm font-semibold text-wn-mono-500 transition-colors hover:text-wn-mono-300"
            }
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
