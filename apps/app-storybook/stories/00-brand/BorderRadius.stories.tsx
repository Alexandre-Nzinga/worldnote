import type { Meta, StoryObj } from "@storybook/react";
import { getBodyTextStyle, getHeadingStyle, headingClass } from "@worldnote/ui";

type RadiusDef = {
  label: string;
  varName: `--${string}`;
  rem: string;
  px: number;
};

const radiusScale: RadiusDef[] = [
  { label: "rounded-xl", varName: "--radius-xl", rem: "0.75rem", px: 12 },
  { label: "rounded-2xl", varName: "--radius-2xl", rem: "1rem", px: 16 },
  { label: "rounded-wn-card", varName: "--radius-wn-card", rem: "1.25rem", px: 20 },
  { label: "rounded-3xl", varName: "--radius-3xl", rem: "1.5rem", px: 24 },
  { label: "rounded-full", varName: "--radius-full", rem: "9999px", px: 9999 },
];

const meta = {
  title: "00-Brand/Border Radius",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const BorderRadius: Story = {
  render: () => (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div className="space-y-3">
        <h1 className={headingClass.h1} style={getHeadingStyle("h1")}>
          Border Radius
        </h1>
        <p className="max-w-3xl" style={getBodyTextStyle("body")}>
          We opt for rounded corners across all UI elements. The exact radius depends on the size
          of the element.
        </p>
      </div>

      <div className="space-y-6">
        {radiusScale.map((radius) => (
          <div key={radius.label} className="grid grid-cols-[220px_1fr] items-center gap-5">
            <div className="space-y-1">
              <p style={{ ...getBodyTextStyle("small"), fontWeight: 600 }}>{radius.label}</p>
              <code style={getBodyTextStyle("xs")}>{`${radius.varName}: ${radius.rem} (${radius.px}px)`}</code>
            </div>
            <div
              className="relative flex w-full items-center justify-center overflow-hidden"
              style={{
                height: "6.5rem",
                borderRadius: `var(${radius.varName})`,
                backgroundColor: "var(--color-wn-indigo-100)",
              }}
            >
              <span
                className="absolute left-0 top-0"
                style={{
                  width: "2rem",
                  height: "2rem",
                  backgroundColor: "var(--color-wn-indigo-500)",
                }}
              />
              <span
                className="absolute right-0 top-0"
                style={{
                  width: "2rem",
                  height: "2rem",
                  backgroundColor: "var(--color-wn-indigo-500)",
                }}
              />
              <span
                className="absolute bottom-0 left-0"
                style={{
                  width: "2rem",
                  height: "2rem",
                  backgroundColor: "var(--color-wn-indigo-500)",
                }}
              />
              <span
                className="absolute bottom-0 right-0"
                style={{
                  width: "2rem",
                  height: "2rem",
                  backgroundColor: "var(--color-wn-indigo-500)",
                }}
              />
              <span style={{ ...getBodyTextStyle("body"), color: "var(--color-wn-indigo-600)", fontWeight: 600 }}>
                {radius.px === 9999 ? "∞" : radius.px}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};
