import type { ChronologyEntry } from "@worldnote/shared";
import { pickDefaultChronologyColor } from "./chronologyPeriodColors.js";

export type ChronologyNode = ChronologyEntry & {
  children: ChronologyNode[];
};

export type ChronologyParentOption = {
  value: string;
  label: string;
  depth: number;
};

export function chronologyGroupId(id: string): string {
  return `chrono-${id}`;
}

export function chronologyItemId(id: string): string {
  return `chronology-${id}`;
}

export function buildChronologyTree(
  entries: ChronologyEntry[],
): ChronologyNode[] {
  const nodes = new Map<string, ChronologyNode>();
  for (const entry of entries) {
    nodes.set(entry.id, { ...entry, children: [] });
  }

  const roots: ChronologyNode[] = [];
  for (const node of nodes.values()) {
    const parentId = node.parent_id ?? null;
    const parentNode = parentId ? nodes.get(parentId) : undefined;
    if (parentNode) {
      parentNode.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (items: ChronologyNode[]) => {
    items.sort(
      (left, right) =>
        left.start_year - right.start_year ||
        left.name.localeCompare(right.name),
    );
    for (const item of items) {
      sortNodes(item.children);
    }
  };
  sortNodes(roots);
  return roots;
}

export function flattenChronologyTree(nodes: ChronologyNode[]): ChronologyNode[] {
  const flat: ChronologyNode[] = [];
  const visit = (items: ChronologyNode[]) => {
    for (const item of items) {
      flat.push(item);
      visit(item.children);
    }
  };
  visit(nodes);
  return flat;
}

function collectDescendantIds(node: ChronologyNode, excluded: Set<string>): void {
  excluded.add(node.id);
  for (const child of node.children) {
    collectDescendantIds(child, excluded);
  }
}

export function listChronologyParentOptions(
  entries: ChronologyEntry[],
  editingId?: string | null,
): ChronologyParentOption[] {
  const tree = buildChronologyTree(entries);
  const excluded = new Set<string>();
  if (editingId) {
    const flat = flattenChronologyTree(tree);
    const editingNode = flat.find((node) => node.id === editingId);
    if (editingNode) {
      collectDescendantIds(editingNode, excluded);
    }
    excluded.add(editingId);
  }

  const options: ChronologyParentOption[] = [
    { value: "", label: "None (top level)", depth: 0 },
  ];

  const visit = (items: ChronologyNode[], depth: number) => {
    for (const item of items) {
      if (!excluded.has(item.id)) {
        const prefix = depth > 0 ? `${"  ".repeat(depth)}└ ` : "";
        options.push({
          value: item.id,
          label: `${prefix}${item.name}`,
          depth,
        });
      }
      visit(item.children, depth + 1);
    }
  };
  visit(tree, 0);
  return options;
}

export function createChronologyDraft(
  parentId?: string | null,
  startYear = 0,
  endYear = 100,
  existing: ChronologyEntry[] = [],
): ChronologyEntry {
  return {
    id: crypto.randomUUID(),
    name: "New period",
    start_year: startYear,
    end_year: endYear,
    parent_id: parentId ?? null,
    color: pickDefaultChronologyColor(existing),
  };
}

export function orphanChronologyChildren(
  deletedId: string,
  entries: ChronologyEntry[],
): ChronologyEntry[] {
  return entries.map((entry) =>
    entry.parent_id === deletedId
      ? { ...entry, parent_id: null }
      : entry,
  );
}

export function resolveChronologyParentEntry(
  parentId: string | null | undefined,
  entries: ChronologyEntry[],
): ChronologyEntry | undefined {
  if (!parentId) {
    return undefined;
  }
  return entries.find((entry) => entry.id === parentId);
}

export function validateChronologyYears(
  startYear: number,
  endYear: number,
  parent?: ChronologyEntry,
): string | null {
  if (!Number.isFinite(startYear) || !Number.isFinite(endYear)) {
    return "Start and end years must be valid numbers.";
  }
  if (startYear > endYear) {
    return "Start year must be on or before end year.";
  }
  if (!parent) {
    return null;
  }
  if (startYear < parent.start_year || endYear > parent.end_year) {
    return `Years must stay within the parent range (${parent.start_year}–${parent.end_year}).`;
  }
  return null;
}

export type ChronologyTimelineGroup = {
  id: string;
  content: string;
  nestedGroups?: string[];
};

export function buildChronologyTimelineGroups(
  entries: ChronologyEntry[],
): ChronologyTimelineGroup[] {
  const tree = buildChronologyTree(entries);
  const groups: ChronologyTimelineGroup[] = [];

  const visit = (node: ChronologyNode): string => {
    const groupId = chronologyGroupId(node.id);
    const nestedGroups = node.children.map(visit);
    groups.push({
      id: groupId,
      content: node.name,
      ...(nestedGroups.length > 0 ? { nestedGroups } : {}),
    });
    return groupId;
  };

  for (const root of tree) {
    visit(root);
  }

  return groups;
}

export function sortChronologyEntries(
  entries: ChronologyEntry[],
): ChronologyEntry[] {
  return [...entries].sort(
    (left, right) =>
      left.start_year - right.start_year ||
      left.name.localeCompare(right.name),
  );
}
