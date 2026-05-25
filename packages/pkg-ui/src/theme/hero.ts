import { heroui } from "@heroui/theme/plugin";

/** HeroUI primary palette — WorldNote azure (matches tailwind.css tokens). */
const azurePrimary = {
  50: "oklch(97% 0.014 254.604)",
  100: "oklch(93.2% 0.032 255.585)",
  200: "oklch(88.2% 0.059 254.128)",
  300: "oklch(80.9% 0.105 251.813)",
  400: "oklch(70.7% 0.165 254.624)",
  500: "oklch(62.3% 0.214 259.815)",
  600: "oklch(54.6% 0.245 262.881)",
  700: "oklch(48.8% 0.243 264.376)",
  800: "oklch(42.4% 0.199 265.638)",
  900: "oklch(37.9% 0.146 265.522)",
  DEFAULT: "oklch(62.3% 0.214 259.815)",
  foreground: "oklch(98.5% 0 0)",
} as const;

export default heroui({
  themes: {
    light: {
      colors: {
        primary: azurePrimary,
      },
    },
    dark: {
      colors: {
        primary: azurePrimary,
      },
    },
  },
});
