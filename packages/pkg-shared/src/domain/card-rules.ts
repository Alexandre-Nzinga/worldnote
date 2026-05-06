import type { CardClass } from "../types/card-class.js";

/**
 * Domain rules placeholder (e.g. Planet ↔ Star constraints).
 * No I/O — pure logic for the Domain layer.
 */
export function describeCardClassRole(cardClass: CardClass): string {
  switch (cardClass) {
    case "atom":
      return "Tangible entities (who/where/what).";
    case "bond":
      return "Abstract forces and traits (how/why).";
    case "molecule":
      return "Containers and hierarchy (context).";
  }
}
