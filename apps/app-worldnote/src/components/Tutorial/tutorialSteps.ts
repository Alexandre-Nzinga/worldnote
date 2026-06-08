export type TutorialPlacement = "top" | "bottom" | "left" | "right" | "center";

export type TutorialTarget =
  | { kind: "none" }
  | { kind: "dom"; anchor: string }
  | { kind: "card"; tutorialAnchor: string }
  | { kind: "stickyNote"; tutorialAnchor: string }
  | { kind: "canvasImage"; imageKey: string }
  | { kind: "region"; value: "canvas" };

export type TutorialAwaitEvent = "card-created" | "card-edited";

export type TutorialStep = {
  id: string;
  title: string;
  body: string;
  target: TutorialTarget;
  placement?: TutorialPlacement;
  requiredView?: "canvas";
  awaitEvent?: TutorialAwaitEvent;
  /** When true, bridge selects the target card before showing the step. */
  selectCard?: boolean;
  openInspector?: boolean;
  /** Card anchor to select/focus when the target is not a card node. */
  focusTutorialAnchor?: string;
  /** Extra pixels to expand the spotlight cutout (hands-on steps). */
  spotlightExpand?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  /** Pin callout away from the target so hands-on UI stays clickable. */
  calloutPlacement?: "corner-top-left";
};

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to WorldNote",
    body: "This quick tour walks through the canvas, cards, links, and tools. You can skip anytime or replay it from Settings.",
    target: { kind: "region", value: "canvas" },
    placement: "center",
    requiredView: "canvas",
  },
  {
    id: "world-menu",
    title: "Navigate the app",
    body: "Use the world menu to return Home, open the Vault, or jump to Settings.",
    target: { kind: "dom", anchor: "canvas-header-menu" },
    placement: "bottom",
    requiredView: "canvas",
  },
  {
    id: "canvas-overview",
    title: "Your world canvas",
    body: "Pan by dragging the background. Scroll or pinch to zoom. Cards, notes, and images all live here.",
    target: { kind: "region", value: "canvas" },
    placement: "center",
    requiredView: "canvas",
  },
  {
    id: "sample-card",
    title: "Meet a card",
    body: "Each card is a typed entity — characters, locations, laws, and more. Click once to preview, twice to edit.",
    target: { kind: "card", tutorialAnchor: "hero-character" },
    placement: "right",
    requiredView: "canvas",
    selectCard: true,
  },
  {
    id: "inspector",
    title: "The Inspector",
    body: "The Inspector shows lore, properties, and socket links for the selected card.",
    target: { kind: "dom", anchor: "canvas-inspector" },
    placement: "left",
    requiredView: "canvas",
    selectCard: true,
    openInspector: true,
    focusTutorialAnchor: "hero-character",
  },
  {
    id: "create-card",
    title: "Create a card",
    body: "Open the create menu and add any card type. Try adding one now — we'll continue when it appears.",
    target: { kind: "dom", anchor: "canvas-toolbar-create" },
    placement: "top",
    calloutPlacement: "corner-top-left",
    spotlightExpand: { top: 480, left: 320, right: 320, bottom: 8 },
    requiredView: "canvas",
    awaitEvent: "card-created",
  },
  {
    id: "edit-card",
    title: "Edit a card",
    body: "Double-click a card or use the Inspector to edit lore and fields. Save your changes to continue.",
    target: { kind: "dom", anchor: "canvas-inspector" },
    placement: "left",
    calloutPlacement: "corner-top-left",
    requiredView: "canvas",
    awaitEvent: "card-edited",
  },
  {
    id: "links",
    title: "Links between cards",
    body: "Drag from a card socket to connect related entities — birthplaces, affiliations, events, and more.",
    target: { kind: "card", tutorialAnchor: "hero-location" },
    placement: "right",
    requiredView: "canvas",
    selectCard: true,
  },
  {
    id: "card-types",
    title: "Card types",
    body: "WorldNote supports atoms, molecules, and bonds — characters, items, polities, laws, and more. Create any type from the toolbar.",
    target: { kind: "card", tutorialAnchor: "hero-polity" },
    placement: "right",
    requiredView: "canvas",
    selectCard: true,
  },
  {
    id: "sticky-note",
    title: "Sticky notes",
    body: "Add lightweight notes directly on the canvas for drafts and reminders.",
    target: { kind: "stickyNote", tutorialAnchor: "sample-note" },
    placement: "left",
    requiredView: "canvas",
  },
  {
    id: "canvas-image",
    title: "Canvas images",
    body: "Place reference art and maps as freestanding images — separate from card cover images.",
    target: { kind: "canvasImage", imageKey: "tutorial-image" },
    placement: "left",
    requiredView: "canvas",
  },
  {
    id: "toolbar-tools",
    title: "Canvas tools",
    body: "Text notes, images, the World Wizard, and the Vault are one click away in the bottom toolbar.",
    target: { kind: "dom", anchor: "canvas-toolbar-dock" },
    placement: "top",
    calloutPlacement: "corner-top-left",
    requiredView: "canvas",
  },
  {
    id: "wizard",
    title: "World Wizard",
    body: "Chat with a local AI to brainstorm lore, fill gaps, or spawn new cards from your world context.",
    target: { kind: "dom", anchor: "canvas-toolbar-wizard" },
    placement: "top",
    calloutPlacement: "corner-top-left",
    requiredView: "canvas",
  },
  {
    id: "views",
    title: "Graph & Timeline",
    body: "Toggle Graph view for relationships or Timeline for chronology when those modules are enabled.",
    target: { kind: "dom", anchor: "canvas-view-toolbar" },
    placement: "right",
    requiredView: "canvas",
  },
  {
    id: "finish",
    title: "You're ready",
    body: "Explore the tutorial world, build your own, or replay this tour anytime from Settings → Profile.",
    target: { kind: "region", value: "canvas" },
    placement: "center",
    requiredView: "canvas",
  },
];
