import {
  DOCS_PATH,
  GITHUB_REPO_URL,
  RELEASES_PAGE_URL,
} from "@/services/github/releases";

export const landingCopy = {
  hero: {
    headline: "Building better worlds",
    subheadline:
      "The offline worldbuilding desktop app for authors and game designers. Visualize and link your characters, places, and lore on a living canvas.",
    secondaryCta: "GitHub",
  },
  bento: {
    sectionTitle: "Everything your universe needs",
    sectionSubtitle:
      "Four core systems that turn scattered notes into a living world.",
    cards: [
      {
        id: "canvas",
        title: "The Canvas",
        description:
          "Move cards freely, attach relations, and draw lines to link family trees, factions, and geographic locations.",
        span: "large" as const,
        slides: [
          {
            id: "create-cards",
            src: "/landing/bento/canvas/create-cards.png",
            alt: "Create Cards — build your world, one card at a time",
          },
          {
            id: "world-wizard",
            src: "/landing/bento/canvas/world-wizard.png",
            alt: "WorldWizard — AI assisted worldbuilding",
          },
          {
            id: "the-canvas",
            src: "/landing/bento/canvas/the-canvas.png",
            alt: "The Canvas — drag, arrange, and think in space",
          },
          {
            id: "simulate",
            src: "/landing/bento/canvas/simulate.png",
            alt: "Simulate dialogue, battles, and more",
          },
          {
            id: "building-better-worlds",
            src: "/landing/bento/canvas/building-better-worlds.png",
            alt: "Building better worlds — notes is good but it can be better",
          },
          {
            id: "local-first",
            src: "/landing/bento/canvas/local-first.png",
            alt: "Your lore, your machine — saved locally with no cloud or subscription",
          },
        ],
        imageAspect: "square" as const,
      },
      {
        id: "graph",
        title: "Graph View",
        description:
          "Step back into an interactive Obsidian-style web to watch your universe organically cluster together.",
        span: "medium" as const,
        slides: [
          {
            id: "graph-view",
            src: "/landing/graph/graph-view.png",
            alt: "Graph view — interactive force-directed web of cards and connections",
          },
        ],
        imageAspect: "video" as const,
      },
      {
        id: "timeline",
        title: "Timelines",
        description:
          "Track deep historical eras and character lifespans as rich horizontal ranges running alongside pinpoint event milestones.",
        span: "medium" as const,
        slides: [
          {
            id: "timeline",
            src: "/landing/timeline/timeline.png",
            alt: "Timeline — eras, character lifespans, and world events on a horizontal axis",
          },
        ],
        imageAspect: "video" as const,
      },
      {
        id: "privacy",
        title: "Local-First",
        description:
          "Your lore belongs to you. Cards are saved completely offline as JSON files on your computer. No cloud accounts, no subscription fees.",
        span: "small" as const,
      },
    ],
  },
  carousel: {
    sectionTitle: "See it in action",
    sectionSubtitle: "A visual workspace built for sprawling fictional worlds.",
    slides: [
      {
        id: "canvas",
        caption: "React Flow canvas — drag, link, and arrange your lore cards",
        icon: "grid_view",
        src: "/landing/canvas/canvas-view.png",
        alt: "React Flow canvas — drag, link, and arrange lore cards on a living workspace",
      },
      {
        id: "graph",
        caption: "Global graph view — watch your universe cluster together",
        icon: "account_tree",
        src: "/landing/graph/graph-view.png",
        alt: "Graph view — interactive force-directed web of cards and connections",
      },
      {
        id: "inspector",
        caption: "Card inspector — edit properties, relations, and metadata",
        icon: "edit_note",
        src: "/landing/inspector/card-inspector.png",
        alt: "Card inspector — edit character properties, relations, and metadata",
      },
    ],
  },
  download: {
    sectionTitle: "Download WorldNote",
    sectionSubtitle:
      "Pick your platform. WorldNote runs fully offline on desktop.",
  },
  footer: {
    tagline: "Building better worlds",
    links: [
      { label: "GitHub Repository", href: GITHUB_REPO_URL },
      { label: "Documentation Wiki", href: DOCS_PATH },
      { label: "Release Changelogs", href: RELEASES_PAGE_URL },
    ],
  },
  nav: {
    docs: "Docs",
    download: "Download",
    github: "GitHub",
  },
} as const;
