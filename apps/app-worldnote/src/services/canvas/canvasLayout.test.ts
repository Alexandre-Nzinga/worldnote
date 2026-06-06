import { describe, expect, it } from "vitest";
import {
  applyCanvasLayoutAction,
  snapFlowPosition,
  snapScalarToGrid,
} from "./canvasLayout.js";

const origin = [0.5, 0] as const;

function node(
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  return { id, position: { x, y }, width, height };
}

describe("snapScalarToGrid", () => {
  it("rounds to the nearest grid step", () => {
    expect(snapScalarToGrid(10, 16)).toBe(16);
    expect(snapScalarToGrid(24, 16)).toBe(32);
    expect(snapScalarToGrid(8, 16)).toBe(16);
  });
});

describe("snapFlowPosition", () => {
  it("snaps both axes", () => {
    expect(snapFlowPosition({ x: 105, y: 23 })).toEqual({ x: 112, y: 16 });
  });
});

describe("applyCanvasLayoutAction", () => {
  it("aligns left edges", () => {
    const updates = applyCanvasLayoutAction(
      [
        node("a", 120, 0, 80, 100),
        node("b", 200, 40, 80, 100),
      ],
      { type: "align", alignment: "align-left" },
      origin,
    );

    expect(updates.get("a")).toEqual({ x: 120, y: 0 });
    expect(updates.get("b")).toEqual({ x: 120, y: 40 });
  });

  it("aligns right edges", () => {
    const updates = applyCanvasLayoutAction(
      [
        node("a", 120, 0, 80, 100),
        node("b", 220, 40, 80, 100),
      ],
      { type: "align", alignment: "align-right" },
      origin,
    );

    expect(updates.get("a")).toEqual({ x: 220, y: 0 });
    expect(updates.get("b")).toEqual({ x: 220, y: 40 });
  });

  it("distributes horizontal spacing between three cards", () => {
    const updates = applyCanvasLayoutAction(
      [
        node("a", 40, 0, 80, 100),
        node("b", 200, 0, 80, 100),
        node("c", 360, 0, 80, 100),
      ],
      { type: "distribute", axis: "distribute-h" },
      origin,
    );

    expect(updates.get("a")).toEqual({ x: 40, y: 0 });
    expect(updates.get("b")).toEqual({ x: 200, y: 0 });
    expect(updates.get("c")).toEqual({ x: 360, y: 0 });
  });

  it("redistributes middle cards when distributing horizontally", () => {
    const updates = applyCanvasLayoutAction(
      [
        node("a", 40, 0, 80, 100),
        node("b", 170, 0, 80, 100),
        node("c", 360, 0, 80, 100),
      ],
      { type: "distribute", axis: "distribute-h" },
      origin,
    );

    expect(updates.get("a")).toEqual({ x: 40, y: 0 });
    expect(updates.get("b")).toEqual({ x: 200, y: 0 });
    expect(updates.get("c")).toEqual({ x: 360, y: 0 });
  });

  it("requires at least two nodes to align", () => {
    const updates = applyCanvasLayoutAction(
      [node("a", 40, 0, 80, 100)],
      { type: "align", alignment: "align-left" },
      origin,
    );
    expect(updates.size).toBe(0);
  });

  it("requires at least three nodes to distribute", () => {
    const updates = applyCanvasLayoutAction(
      [node("a", 40, 0, 80, 100), node("b", 200, 0, 80, 100)],
      { type: "distribute", axis: "distribute-h" },
      origin,
    );
    expect(updates.size).toBe(0);
  });
});
