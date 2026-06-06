import { LANDING_ANCHORS, landingAnchorHref } from "./landingAnchors";
import { LANDING_LINKS } from "./landingLinks";

export const heroContent = {
  headline: "Build better worlds",
  subheadline:
    " ",
  secondaryLinkPrefix: "Looking for another OS?",
  secondaryLinkLabel: "View all builds",
  secondaryLinkHref: landingAnchorHref(LANDING_ANCHORS.download),
} as const;

export const navItems = [
  { label: "Features", href: landingAnchorHref(LANDING_ANCHORS.features) },
  { label: "Timeline", href: landingAnchorHref(LANDING_ANCHORS.timeline) },
  { label: "Graph View", href: landingAnchorHref(LANDING_ANCHORS.graph) },
  { label: "Security", href: landingAnchorHref(LANDING_ANCHORS.security) },
] as const;

export const headerCta = {
  label: "Download Client",
  href: landingAnchorHref(LANDING_ANCHORS.download),
} as const;

export type PillarVariant = "canvas" | "graph" | "timeline";

export const featurePillars = [
  {
    variant: "canvas" as PillarVariant,
    headline: "Non-Linear Connections.",
    body: "Stop fighting rigid folders. Drag, drop, and link character cards, regional factions, and lore artifacts on a living canvas that mirrors how your brain actually creates.",
  },
  {
    id: LANDING_ANCHORS.graph,
    variant: "graph" as PillarVariant,
    headline: "The Global Graph View.",
    body: "Watch your universe weave itself. Step back from the canvas and witness your character lifespans, family trees, and trade routes cluster into an organic, interactive web of relational data.",
  },
  {
    id: LANDING_ANCHORS.timeline,
    variant: "timeline" as PillarVariant,
    headline: "Ages, Eras, and Epoches.",
    body: "Custom fantasy calendars and deep sci-fi timelines built without boundaries. Track character lifespans as rich horizontal ranges running alongside pinpoint historical events.",
  },
] as const;

export const manifestoContent = {
  headline: "Your worlds. Your files. Permanently.",
  subheadline:
    "WorldNote is local-first. Your maps, stories, and connections are written directly to open, human-readable .md markdown files on your machine. No mandatory accounts, no cloud dependencies, and zero corporate lock-in. Backed by strict contract verification.",
} as const;

export const workflowSteps = [
  {
    number: "01",
    title: "Spawn a Card.",
    description:
      "Create characters, locations, or custom events with structural properties.",
  },
  {
    number: "02",
    title: "Draw the Thread.",
    description:
      "Visually link them across the workspace canvas to instantly map out relationships.",
  },
  {
    number: "03",
    title: "Simulate History.",
    description:
      "Switch instantly to the global graph or timeline module to watch your lore come alive.",
  },
] as const;

export const downloadMatrixContent = {
  headline: "Ready to cross the threshold?",
  platforms: [
    {
      platform: "windows" as const,
      title: "Windows Installer",
      subtitle: "Setup wizard (.exe)",
    },
    {
      platform: "mac" as const,
      title: "macOS Build",
      subtitle: "Apple Silicon & Intel (.dmg)",
    },
    {
      platform: "linux" as const,
      title: "Linux Package",
      subtitle: "AppImage & Debian (.AppImage / .deb)",
    },
  ],
} as const;

export const footerContent = {
  tagline: "Carve your scars into the lore.",
  copyright: "© 2026 WorldNote. Local-first worldbuilding.",
  links: [
    { label: "GitHub Repository", href: LANDING_LINKS.github },
    { label: "Release Notes", href: LANDING_LINKS.releases },
    { label: "Documentation", href: LANDING_LINKS.documentation },
    { label: "Report an Issue", href: LANDING_LINKS.reportIssue },
  ],
} as const;
