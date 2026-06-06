export const LANDING_ANCHORS = {
  features: "features",
  timeline: "timeline",
  graph: "graph",
  security: "security",
  workflow: "workflow",
  download: "download",
} as const;

export type LandingAnchor = (typeof LANDING_ANCHORS)[keyof typeof LANDING_ANCHORS];

export function landingAnchorHref(anchor: LandingAnchor): string {
  return `#${anchor}`;
}
