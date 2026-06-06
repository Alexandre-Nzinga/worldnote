export type GraphForceSettings = {
  centreForce: number;
  repelForce: number;
  linkForce: number;
  linkDistance: number;
};

export const DEFAULT_GRAPH_FORCE_SETTINGS: GraphForceSettings = {
  centreForce: 0.2,
  repelForce: 120,
  linkForce: 1,
  linkDistance: 250,
};
