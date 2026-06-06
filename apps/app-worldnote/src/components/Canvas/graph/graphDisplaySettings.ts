export type GraphDisplaySettings = {
  showArrows: boolean;
  textFadeThreshold: number;
  nodeSize: number;
  linkThickness: number;
};

export const DEFAULT_GRAPH_DISPLAY_SETTINGS: GraphDisplaySettings = {
  showArrows: false,
  textFadeThreshold: 0.8,
  nodeSize: 3,
  linkThickness: 1,
};
