export type CardImageFit = "fit" | "fill" | "crop";

export type CardImagePosition = {
  x: number;
  y: number;
};

export function cardImageObjectStyles(
  fit: CardImageFit,
  position: CardImagePosition,
): { objectFit: "contain" | "cover"; objectPosition: string } {
  const objectPosition = `${position.x}% ${position.y}%`;
  if (fit === "fit") {
    return { objectFit: "contain", objectPosition };
  }
  return { objectFit: "cover", objectPosition };
}
