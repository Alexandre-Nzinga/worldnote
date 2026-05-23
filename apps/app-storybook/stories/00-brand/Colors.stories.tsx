import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  getBodyTextStyle,
  getHeadingStyle,
  headingClass,
  worldnoteColorPalette,
} from "@worldnote/ui";

type StepHexMap = Record<string, string>;

const meta = {
  title: "00-Brand/Colors",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function cssVarForStep(cssRoot: string, step: number) {
  return `${cssRoot}-${step}`;
}

function rgbStringToHex(rgb: string) {
  const matches = rgb.match(/\d+/g);
  if (!matches || matches.length < 3) {
    return "#000000";
  }

  const [r, g, b] = matches.slice(0, 3).map((value) => Number(value));
  return `#${[r, g, b]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

function normalizeHex(value: string) {
  const hex = value.replace("#", "").trim();
  if (hex.length === 3) {
    return `#${hex
      .split("")
      .map((char) => char + char)
      .join("")
      .toUpperCase()}`;
  }
  if (hex.length >= 6) {
    return `#${hex.slice(0, 6).toUpperCase()}`;
  }
  return "#000000";
}

function colorStringToHex(color: string) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return "#000000";
  }

  ctx.fillStyle = "#000000";
  ctx.fillStyle = color;
  const normalized = ctx.fillStyle;

  if (normalized.startsWith("#")) {
    return normalizeHex(normalized);
  }
  if (normalized.startsWith("rgb")) {
    return rgbStringToHex(normalized);
  }

  return "#000000";
}

function resolveHexFromCssVar(cssVar: string) {
  const probe = document.createElement("span");
  probe.style.color = `var(${cssVar})`;
  probe.style.position = "absolute";
  probe.style.opacity = "0";
  probe.style.pointerEvents = "none";
  document.body.appendChild(probe);

  const computedColor = getComputedStyle(probe).color;
  document.body.removeChild(probe);

  return colorStringToHex(computedColor);
}

function getRelativeLuminance(hex: string) {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) {
    return 0;
  }

  const r = Number.parseInt(normalized.slice(0, 2), 16) / 255;
  const g = Number.parseInt(normalized.slice(2, 4), 16) / 255;
  const b = Number.parseInt(normalized.slice(4, 6), 16) / 255;

  const linearize = (value: number) =>
    value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function getReadableTextColor(hex: string) {
  const bgLuminance = getRelativeLuminance(hex);
  const darkText = "#111827";
  const lightText = "#F8FAFC";
  const darkContrast =
    (Math.max(bgLuminance, 0) + 0.05) / (Math.min(bgLuminance, 0) + 0.05);
  const lightContrast =
    (Math.max(bgLuminance, 1) + 0.05) / (Math.min(bgLuminance, 1) + 0.05);
  return darkContrast >= lightContrast ? darkText : lightText;
}

function usePaletteHexMap() {
  return useMemo(() => {
    if (typeof document === "undefined") {
      return {} as StepHexMap;
    }

    const map: StepHexMap = {};

    for (const palette of worldnoteColorPalette) {
      for (const step of palette.steps) {
        const cssVar = cssVarForStep(palette.cssRoot, step);
        map[cssVar] = resolveHexFromCssVar(cssVar);
      }
    }

    return map;
  }, []);
}

export const PaletteReference: Story = {
  name: "Colors",
  render: () => {
    const hexMap = usePaletteHexMap();
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const copyHex = async (hex: string, key: string) => {
      try {
        await navigator.clipboard.writeText(hex);
        setCopiedKey(key);
        window.setTimeout(() => {
          setCopiedKey((current) => (current === key ? null : current));
        }, 1200);
      } catch {
        setCopiedKey(null);
      }
    };

    return (
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-10">
        <header className="space-y-3">
          <h1 className={headingClass.h1} style={getHeadingStyle("h1")}>
            WorldNote color palette
          </h1>
          <p
            className="max-w-3xl leading-6"
            style={{
              ...getBodyTextStyle("body"),
              color: "var(--color-wn-mono-700)",
              fontWeight: 500,
            }}
          >
            Theme colors and complete scale ramps from 50 (lightest) to 950
            (darkest).
          </p>
        </header>

        <section className="space-y-5">
          <h3 className={headingClass.h3} style={getHeadingStyle("h3")}>
            Theme
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {worldnoteColorPalette.map((palette) => {
              const cssVar = cssVarForStep(palette.cssRoot, palette.baseStep);
              const hex = hexMap[cssVar] ?? "#000000";
              const textColor = getReadableTextColor(hex);

              return (
                <article key={palette.name} className="space-y-2">
                  <div
                    className="rounded-2xl border p-5"
                    style={{
                      backgroundColor: `var(${cssVar})`,
                      borderColor: "var(--color-wn-mono-300)",
                    }}
                  >
                    <p
                      className="text-2xl font-semibold leading-tight"
                      style={{ color: textColor }}
                    >
                      {palette.label}
                    </p>
                    <button
                      type="button"
                      className="mt-2 underline decoration-transparent transition hover:decoration-current"
                      style={{
                        ...getBodyTextStyle("body"),
                        color: textColor,
                        fontWeight: 500,
                      }}
                      onClick={() =>
                        void copyHex(hex, `${palette.name}-${palette.baseStep}`)
                      }
                      title="Copy hex color"
                    >
                      {copiedKey === `${palette.name}-${palette.baseStep}`
                        ? "Copied"
                        : hex}
                    </button>
                  </div>
                  <code
                    className="text-wn-mono-500"
                    style={getBodyTextStyle("xs")}
                  >
                    {cssVar}
                  </code>
                </article>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className={headingClass.h3} style={getHeadingStyle("h3")}>
            Scales
          </h3>
          <p
            style={{
              ...getBodyTextStyle("small"),
              color: "var(--color-wn-mono-600)",
            }}
          >
            Full shade ranges from 50 (lightest) to 950 (darkest). The dot marks
            the base color.
          </p>

          <div className="space-y-6">
            {worldnoteColorPalette.map((palette) => {
              const gradientStops = palette.steps
                .map((step) => `var(${cssVarForStep(palette.cssRoot, step)})`)
                .join(", ");

              return (
                <div
                  key={palette.name}
                  className="grid grid-cols-[200px_1fr] gap-5"
                >
                  <div className="space-y-2 pt-1">
                    <p className="text-2xl font-semibold text-wn-mono-900">
                      {palette.label}
                    </p>
                    <code
                      className="text-wn-mono-500"
                      style={getBodyTextStyle("small")}
                    >
                      {palette.cssRoot}-[step]
                    </code>
                    <div
                      className="h-6 rounded-full border"
                      style={{
                        backgroundImage: `linear-gradient(to right, ${gradientStops})`,
                        borderColor: "var(--color-wn-mono-300)",
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-11 gap-2">
                    {palette.steps.map((step) => {
                      const cssVar = cssVarForStep(palette.cssRoot, step);
                      const hex = hexMap[cssVar] ?? "#000000";
                      const isBase = step === palette.baseStep;
                      const textColor = getReadableTextColor(hex);
                      const markerColor =
                        textColor === "#111827" ? "#111827" : "#E5E7EB";

                      return (
                        <article
                          key={step}
                          className="relative rounded-xl border p-3"
                          style={{
                            backgroundColor: `var(${cssVar})`,
                            borderColor: "var(--color-wn-mono-300)",
                          }}
                        >
                          {isBase && (
                            <span
                              className="absolute left-2 top-2 h-2 w-2 rounded-full"
                              style={{ backgroundColor: markerColor }}
                            />
                          )}
                          <p
                            className="text-lg font-semibold"
                            style={{ color: textColor }}
                          >
                            {step}
                          </p>
                          <button
                            type="button"
                            className="mt-1 text-left underline decoration-transparent transition hover:decoration-current"
                            style={{
                              ...getBodyTextStyle("xs"),
                              color: textColor,
                              fontWeight: 500,
                            }}
                            onClick={() =>
                              void copyHex(hex, `${palette.name}-${step}`)
                            }
                            title="Copy hex color"
                          >
                            {copiedKey === `${palette.name}-${step}`
                              ? "Copied"
                              : hex}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  },
};
