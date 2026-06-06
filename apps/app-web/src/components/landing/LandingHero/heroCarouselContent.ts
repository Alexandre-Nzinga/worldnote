export type HeroCarouselImageItem = {
  id: string;
  /** Drop real assets in public/landing/ and set e.g. "/landing/hero-01.webp" */
  src?: string;
  alt: string;
};

export const heroCarouselRowOne: HeroCarouselImageItem[] = [
  { id: "r1-1", alt: "Canvas workspace preview" },
  { id: "r1-2", alt: "Character portrait preview" },
  { id: "r1-3", alt: "Graph view preview" },
  { id: "r1-4", alt: "Region map preview" },
  { id: "r1-5", alt: "Timeline preview" },
  { id: "r1-6", alt: "Faction sigil preview" },
];

export const heroCarouselRowTwo: HeroCarouselImageItem[] = [
  { id: "r2-1", alt: "Chronology preview" },
  { id: "r2-2", alt: "Trade route preview" },
  { id: "r2-3", alt: "Lore board preview" },
  { id: "r2-4", alt: "Bloodline preview" },
  { id: "r2-5", alt: "Capital city preview" },
  { id: "r2-6", alt: "Family tree preview" },
];
