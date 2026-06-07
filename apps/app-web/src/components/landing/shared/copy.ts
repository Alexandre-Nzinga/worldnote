import {
  DOCS_WIKI_URL,
  GITHUB_REPO_URL,
  RELEASES_PAGE_URL,
} from "@/services/github/releases";

export const landingCopy = {
  hero: {
    headline: "Building better worlds",
    subheadline:
      "The offline worldbuilding desktop app for authors and game designers. Visualize and link your characters, places, and lore on a living canvas.",
    secondaryCta: "View on GitHub",
  },
  bento: {
    sectionTitle: "Everything your universe needs",
    sectionSubtitle:
      "Four core systems that turn scattered notes into a living world.",
    cards: [
      {
        id: "canvas",
        title: "The Canvas Interface",
        description:
          "Move cards freely, attach relations, and draw lines to link family trees, factions, and geographic locations.",
        span: "large" as const,
      },
      {
        id: "graph",
        title: "Global Graph View",
        description:
          "Step back into an interactive Obsidian-style web to watch your universe organically cluster together.",
        span: "medium" as const,
      },
      {
        id: "timeline",
        title: "Chronological Timelines",
        description:
          "Track deep historical eras and character lifespans as rich horizontal ranges running alongside pinpoint event milestones.",
        span: "medium" as const,
      },
      {
        id: "privacy",
        title: "Local-First Privacy",
        description:
          "Your lore belongs to you. Saved completely offline to standard markdown (.md) files on your computer. No cloud accounts, no subscription fees.",
        span: "small" as const,
      },
    ],
  },
  carousel: {
    sectionTitle: "See it in action",
    sectionSubtitle:
      "A visual workspace built for sprawling fictional worlds.",
    slides: [
      {
        id: "canvas",
        caption: "React Flow canvas — drag, link, and arrange your lore cards",
        icon: "grid_view",
      },
      {
        id: "graph",
        caption: "Global graph view — watch your universe cluster together",
        icon: "account_tree",
      },
      {
        id: "inspector",
        caption: "Card inspector — edit properties, relations, and metadata",
        icon: "edit_note",
      },
    ],
  },
  download: {
    sectionTitle: "Download Center",
    sectionSubtitle: "Pick your platform. WorldNote runs fully offline on desktop.",
  },
  footer: {
    tagline: "Building better worlds",
    links: [
      { label: "GitHub Repository", href: GITHUB_REPO_URL },
      { label: "Documentation Wiki", href: DOCS_WIKI_URL },
      { label: "Release Changelogs", href: RELEASES_PAGE_URL },
    ],
  },
  nav: {
    download: "Download",
    github: "GitHub",
  },
} as const;
