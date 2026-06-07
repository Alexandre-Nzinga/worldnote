import { describe, expect, it } from "vitest";
import {
  buildChronologyTree,
  listChronologyParentOptions,
  orphanChronologyChildren,
} from "./timelineChronology.js";

describe("buildChronologyTree", () => {
  it("nests entries under a parent id", () => {
    const tree = buildChronologyTree([
      {
        id: "00000000-0000-4000-8000-000000000001",
        name: "Middle Ages",
        start_year: 500,
        end_year: 1500,
      },
      {
        id: "00000000-0000-4000-8000-000000000002",
        name: "12th Century",
        start_year: 1100,
        end_year: 1199,
        parent_id: "00000000-0000-4000-8000-000000000001",
      },
    ]);

    expect(tree).toHaveLength(1);
    expect(tree[0]?.children).toHaveLength(1);
    expect(tree[0]?.children[0]?.name).toBe("12th Century");
  });
});

describe("listChronologyParentOptions", () => {
  it("excludes the edited node and its descendants", () => {
    const parentId = "00000000-0000-4000-8000-000000000001";
    const childId = "00000000-0000-4000-8000-000000000002";
    const entries = [
      {
        id: parentId,
        name: "Middle Ages",
        start_year: 500,
        end_year: 1500,
      },
      {
        id: childId,
        name: "12th Century",
        start_year: 1100,
        end_year: 1199,
        parent_id: parentId,
      },
    ];

    const options = listChronologyParentOptions(entries, parentId);

    expect(options.some((option) => option.label.includes("Middle Ages"))).toBe(
      false,
    );
    expect(options.some((option) => option.label.includes("12th Century"))).toBe(
      false,
    );
  });
});

describe("orphanChronologyChildren", () => {
  it("clears parent links when a parent is deleted", () => {
    const parentId = "00000000-0000-4000-8000-000000000001";
    const childId = "00000000-0000-4000-8000-000000000002";
    const entries = [
      {
        id: parentId,
        name: "Middle Ages",
        start_year: 500,
        end_year: 1500,
      },
      {
        id: childId,
        name: "12th Century",
        start_year: 1100,
        end_year: 1199,
        parent_id: parentId,
      },
    ];

    const next = orphanChronologyChildren(parentId, entries);
    expect(next[1]?.parent_id).toBeNull();
  });
});
