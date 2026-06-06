export type GraphFilterSettings = {
  showTags: boolean;
  showAttachments: boolean;
  canvasCardsOnly: boolean;
  showOrphans: boolean;
};

export const DEFAULT_GRAPH_FILTER_SETTINGS: GraphFilterSettings = {
  showTags: false,
  showAttachments: true,
  canvasCardsOnly: false,
  showOrphans: true,
};
