import type { ChronologyEntry } from "@worldnote/shared";
import {
  Button,
  getBodyTextStyle,
  getHeadingProps,
  MaterialSymbol,
} from "@worldnote/ui";
import { useMemo, useState } from "react";
import {
  buildChronologyTree,
  createChronologyDraft,
  type ChronologyNode,
} from "../../../services/timeline/timelineChronology.js";
import { formatTimelineDateLabel } from "../../../services/timeline/calendarFormat.js";
import { normalizeChronologyColor } from "../../../services/timeline/chronologyPeriodColors.js";
import {
  panelRowListClassName,
  surfacePanelClassName,
  surfacePanelStackClassName,
} from "../../shell/pageShellStyles.js";

type TimelineChronologySidebarProps = {
  chronology: ChronologyEntry[];
  suffix: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onEdit: (entry: ChronologyEntry) => void;
  onCreate: (entry: ChronologyEntry) => void;
  onDelete: (id: string) => void;
};

const rowActionButtonClassName =
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-wn-text-muted transition-colors hover:bg-wn-surface-raised hover:text-wn-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wn-primary";

function ChronologyTreeRow({
  node,
  depth,
  suffix,
  selectedId,
  chronology,
  onSelect,
  onEdit,
  onDelete,
}: {
  node: ChronologyNode;
  depth: number;
  suffix: string;
  selectedId: string | null;
  chronology: ChronologyEntry[];
  onSelect: (id: string) => void;
  onEdit: (entry: ChronologyEntry) => void;
  onDelete: (id: string) => void;
}) {
  const isSelected = selectedId === node.id;
  const dateLabel = formatTimelineDateLabel(
    node.start_year,
    node.end_year,
    suffix,
  );
  const entry = chronology.find((item) => item.id === node.id);
  const periodColor = normalizeChronologyColor(node.color);

  return (
    <>
      <li
        className={[
          "group relative list-none",
          depth > 0 ? "border-l border-wn-border/70" : "",
        ].join(" ")}
        style={{
          marginLeft: depth > 0 ? `${8 + (depth - 1) * 12}px` : undefined,
        }}
      >
        <div
          className={[
            "flex items-center gap-2 rounded-xl py-2 pr-1 pl-2 transition-colors",
            isSelected ? "bg-wn-surface-raised" : "hover:bg-wn-surface-sunken",
          ].join(" ")}
        >
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
            onClick={() => onSelect(node.id)}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-wn-border ring-inset"
              style={{
                backgroundColor: periodColor ?? "var(--color-wn-mono-700)",
              }}
              aria-hidden
            />
            <span className="min-w-0 flex-1">
              <p
                className="truncate text-wn-text"
                style={getBodyTextStyle("small")}
              >
                {node.name}
              </p>
              <p
                className="truncate text-wn-text-muted"
                style={getBodyTextStyle("xs")}
              >
                {dateLabel}
              </p>
            </span>
          </button>

          <div
            className={[
              "flex shrink-0 items-center gap-0.5 transition-opacity",
              isSelected
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
            ].join(" ")}
          >
            <button
              type="button"
              className={rowActionButtonClassName}
              aria-label={`Edit ${node.name}`}
              onClick={() => {
                if (entry) {
                  onEdit(entry);
                }
              }}
            >
              <MaterialSymbol name="edit" className="text-[18px]" />
            </button>
            <button
              type="button"
              className={rowActionButtonClassName}
              aria-label={`Delete ${node.name}`}
              onClick={() => onDelete(node.id)}
            >
              <MaterialSymbol name="delete" className="text-[18px]" />
            </button>
          </div>
        </div>
      </li>

      {node.children.map((child) => (
        <ChronologyTreeRow
          key={child.id}
          node={child}
          depth={depth + 1}
          suffix={suffix}
          selectedId={selectedId}
          chronology={chronology}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}

export function TimelineChronologySidebar({
  chronology,
  suffix,
  selectedId,
  onSelect,
  onEdit,
  onCreate,
  onDelete,
}: TimelineChronologySidebarProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const tree = useMemo(() => buildChronologyTree(chronology), [chronology]);

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      onDelete(id);
      setConfirmDeleteId(null);
      if (selectedId === id) {
        onSelect(null);
      }
      return;
    }
    setConfirmDeleteId(id);
  };

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-3 p-4">
      <div className="scrollbar-wn min-h-0 flex-1 overflow-y-auto scroll-pb-4">
        <div className={surfacePanelStackClassName}>
          <section className={`${surfacePanelClassName} flex flex-col gap-3`}>
            <div className="flex flex-col gap-1.5">
              <h3 {...getHeadingProps("h6", { tone: "inverse" })}>
                Time periods
              </h3>
              <p style={getBodyTextStyle("xs")} className="text-wn-text-muted">
                Select a period to focus it on the timeline. Nest periods using
                the Parent field when editing.
              </p>
            </div>

            {confirmDeleteId ? (
              <div className="rounded-xl border border-wn-red-500/40 bg-wn-red-500/10 px-3 py-3">
                <p style={getBodyTextStyle("xs")} className="text-wn-text">
                  Delete this period? Nested entries move to the top level.
                </p>
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => setConfirmDeleteId(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onPress={() => handleDelete(confirmDeleteId)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ) : null}

            {tree.length === 0 ? (
              <p
                style={getBodyTextStyle("small")}
                className="rounded-xl bg-wn-surface-sunken px-3 py-4 text-center text-wn-text-muted"
              >
                No periods yet. Add one below, then nest others inside it from
                the editor.
              </p>
            ) : (
              <ul className={`${panelRowListClassName} m-0 p-0`}>
                {tree.map((node) => (
                  <ChronologyTreeRow
                    key={node.id}
                    node={node}
                    depth={0}
                    suffix={suffix}
                    selectedId={selectedId}
                    chronology={chronology}
                    onSelect={onSelect}
                    onEdit={onEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <div className="shrink-0">
        <Button
          type="button"
          variant="white"
          className="w-full"
          onPress={() =>
            onCreate(createChronologyDraft(selectedId, 0, 100, chronology))
          }
        >
          <MaterialSymbol name="add" />
          Add period
        </Button>
      </div>
    </aside>
  );
}
