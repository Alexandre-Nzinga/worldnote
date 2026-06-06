import type { ForceGraphMethods } from "react-force-graph-2d";
import type { GraphForceSettings } from "../../components/Canvas/graph/graphForceSettings.js";
import type { GraphNode } from "./buildGraphData.js";

function hasStrength(
  force: unknown,
): force is { strength: (value: number) => unknown } {
  return (
    typeof force === "object" &&
    force !== null &&
    "strength" in force &&
    typeof force.strength === "function"
  );
}

function hasDistance(
  force: unknown,
): force is { distance: (value: number) => unknown } {
  return (
    typeof force === "object" &&
    force !== null &&
    "distance" in force &&
    typeof force.distance === "function"
  );
}

/** Applies sidebar force sliders to the live d3-force simulation. */
export function applyGraphForceSettings(
  graph: ForceGraphMethods<GraphNode, unknown>,
  settings: GraphForceSettings,
): void {
  const center = graph.d3Force("center");
  if (hasStrength(center)) {
    center.strength(settings.centreForce);
  }

  const charge = graph.d3Force("charge");
  if (hasStrength(charge)) {
    charge.strength(-Math.abs(settings.repelForce));
  }

  const link = graph.d3Force("link");
  if (hasStrength(link)) {
    link.strength(settings.linkForce);
  }
  if (hasDistance(link)) {
    link.distance(settings.linkDistance);
  }

  graph.d3ReheatSimulation();
}
