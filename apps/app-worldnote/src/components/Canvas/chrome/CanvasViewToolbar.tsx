import { useMemo } from "react";
import {
  dockInactiveClassName,
  primaryAccentFillClassName,
} from "../../../services/settings/primaryAccentStyles.js";
import { DockTabs, type DockTabItem } from "../../ui/DockTabs.js";

type CanvasViewToolbarProps = {
  className?: string;
  onToggleGraphView?: () => void;
  isGraphViewOpen?: boolean;
  onToggleTimeline?: () => void;
  isTimelineOpen?: boolean;
};

export function CanvasViewToolbar({
  className,
  onToggleGraphView,
  isGraphViewOpen = false,
  onToggleTimeline,
  isTimelineOpen = false,
}: CanvasViewToolbarProps) {
  const items = useMemo<DockTabItem[]>(() => {
    const dockItems: DockTabItem[] = [];

    if (onToggleGraphView) {
      dockItems.push({
        id: "graph-view",
        name: "Graph view",
        icon: "hub",
        colorClassName: isGraphViewOpen
          ? primaryAccentFillClassName
          : dockInactiveClassName,
        isActive: isGraphViewOpen,
        onPress: onToggleGraphView,
      });
    }

    if (onToggleTimeline) {
      dockItems.push({
        id: "timeline",
        name: "Timeline",
        icon: "timeline",
        colorClassName: isTimelineOpen
          ? primaryAccentFillClassName
          : dockInactiveClassName,
        isActive: isTimelineOpen,
        onPress: onToggleTimeline,
      });
    }

    return dockItems;
  }, [isGraphViewOpen, isTimelineOpen, onToggleGraphView, onToggleTimeline]);

  if (items.length === 0) {
    return null;
  }

  return (
    <aside
      className={`pointer-events-none absolute left-4 top-1/2 z-20 -translate-y-1/2 ${className ?? ""}`}
    >
      <div className="pointer-events-auto">
        <DockTabs items={items} orientation="vertical" />
      </div>
    </aside>
  );
}
