import {
  Button,
  wnLabelClassName,
  getHeadingProps,
  MaterialSymbol,
} from "@worldnote/ui";
import { useState, type ReactNode } from "react";
import { primaryAccentFillClassName } from "../../../services/settings/primaryAccentStyles.js";
import {
  surfacePanelClassName,
  surfacePanelStackClassName,
} from "../../shell/pageShellStyles.js";
import { ToggleSwitchRow } from "../../shell/ToggleSwitch.js";
import type { GraphDisplaySettings } from "./graphDisplaySettings.js";
import type { GraphFilterSettings } from "./graphFilterSettings.js";
import type { GraphForceSettings } from "./graphForceSettings.js";

type GraphViewSidebarProps = {
  displaySettings: GraphDisplaySettings;
  filterSettings: GraphFilterSettings;
  forceSettings: GraphForceSettings;
  searchQuery: string;
  onDisplaySettingsChange: (patch: Partial<GraphDisplaySettings>) => void;
  onFilterSettingsChange: (patch: Partial<GraphFilterSettings>) => void;
  onForceSettingsChange: (patch: Partial<GraphForceSettings>) => void;
  onSearchQueryChange: (query: string) => void;
  onAnimate: () => void;
};

const sliderClassName =
  "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-wn-surface-raised accent-wn-primary";

const searchInputClassName =
  "w-full rounded-xl border-0 bg-wn-surface-raised py-2.5 pl-9 pr-3 text-sm text-wn-text shadow-none outline-none transition-colors placeholder:text-wn-text-subtle hover:bg-wn-mono-800 focus:bg-wn-mono-800 focus:ring-2 focus:ring-wn-mono-600";

function GraphSliderRow({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className={wnLabelClassName}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={sliderClassName}
        aria-label={label}
      />
    </label>
  );
}

function GraphCollapsibleSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className={surfacePanelClassName}>
      <button
        type="button"
        className="flex w-full items-center gap-1 text-left"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <MaterialSymbol
          name="expand_more"
          className={`text-[18px] text-wn-text-muted transition-transform ${
            isOpen ? "rotate-0" : "-rotate-90"
          }`}
        />
        <span {...getHeadingProps("h6", { tone: "inverse" })}>{title}</span>
      </button>
      {isOpen ? <div className="mt-4 flex flex-col gap-4">{children}</div> : null}
    </section>
  );
}

export function GraphViewSidebar({
  displaySettings,
  filterSettings,
  forceSettings,
  searchQuery,
  onDisplaySettingsChange,
  onFilterSettingsChange,
  onForceSettingsChange,
  onSearchQueryChange,
  onAnimate,
}: GraphViewSidebarProps) {
  const [displayOpen, setDisplayOpen] = useState(true);
  const [forcesOpen, setForcesOpen] = useState(true);

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-3 p-4">
      <div className="scrollbar-wn min-h-0 flex-1 overflow-y-auto scroll-pb-4">
        <div className={surfacePanelStackClassName}>
          <section className={`${surfacePanelClassName} flex flex-col gap-4`}>
            <div className="relative">
              <MaterialSymbol
                name="search"
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[18px] text-wn-text-muted"
                aria-hidden
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                placeholder="Search..."
                aria-label="Search graph"
                className={searchInputClassName}
              />
            </div>

            <ToggleSwitchRow
              label="Tags"
              checked={filterSettings.showTags}
              onChange={(showTags) => onFilterSettingsChange({ showTags })}
            />
            <ToggleSwitchRow
              label="Attachments"
              checked={filterSettings.showAttachments}
              onChange={(showAttachments) =>
                onFilterSettingsChange({ showAttachments })
              }
            />
            <ToggleSwitchRow
              label="Existing files only"
              checked={filterSettings.canvasCardsOnly}
              onChange={(canvasCardsOnly) =>
                onFilterSettingsChange({ canvasCardsOnly })
              }
            />
            <ToggleSwitchRow
              label="Orphans"
              checked={filterSettings.showOrphans}
              onChange={(showOrphans) => onFilterSettingsChange({ showOrphans })}
            />
          </section>

          <GraphCollapsibleSection
            title="Display"
            isOpen={displayOpen}
            onToggle={() => setDisplayOpen((open) => !open)}
          >
            <ToggleSwitchRow
              label="Arrows"
              checked={displaySettings.showArrows}
              onChange={(showArrows) => onDisplaySettingsChange({ showArrows })}
            />
            <GraphSliderRow
              label="Text fade threshold"
              min={0.2}
              max={2}
              step={0.1}
              value={displaySettings.textFadeThreshold}
              onChange={(textFadeThreshold) =>
                onDisplaySettingsChange({ textFadeThreshold })
              }
            />
            <GraphSliderRow
              label="Node size"
              min={1}
              max={8}
              step={0.5}
              value={displaySettings.nodeSize}
              onChange={(nodeSize) => onDisplaySettingsChange({ nodeSize })}
            />
            <GraphSliderRow
              label="Link thickness"
              min={0.5}
              max={4}
              step={0.25}
              value={displaySettings.linkThickness}
              onChange={(linkThickness) =>
                onDisplaySettingsChange({ linkThickness })
              }
            />
          </GraphCollapsibleSection>

          <GraphCollapsibleSection
            title="Forces"
            isOpen={forcesOpen}
            onToggle={() => setForcesOpen((open) => !open)}
          >
            <GraphSliderRow
              label="Centre force"
              min={0}
              max={1}
              step={0.05}
              value={forceSettings.centreForce}
              onChange={(centreForce) => onForceSettingsChange({ centreForce })}
            />
            <GraphSliderRow
              label="Repel force"
              min={0}
              max={300}
              step={5}
              value={forceSettings.repelForce}
              onChange={(repelForce) => onForceSettingsChange({ repelForce })}
            />
            <GraphSliderRow
              label="Link force"
              min={0}
              max={2}
              step={0.05}
              value={forceSettings.linkForce}
              onChange={(linkForce) => onForceSettingsChange({ linkForce })}
            />
            <GraphSliderRow
              label="Link distance"
              min={10}
              max={500}
              step={5}
              value={forceSettings.linkDistance}
              onChange={(linkDistance) => onForceSettingsChange({ linkDistance })}
            />
          </GraphCollapsibleSection>
        </div>
      </div>

      <div className="shrink-0">
        <Button
          type="button"
          variant="white"
          className="w-full"
          onPress={onAnimate}
        >
          Animate
        </Button>
      </div>
    </aside>
  );
}
