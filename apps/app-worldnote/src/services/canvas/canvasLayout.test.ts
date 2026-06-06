import { describe, expect, it } from "vitest";
import { snapFlowPosition, snapScalarToGrid } from "./canvasLayout.js";

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
