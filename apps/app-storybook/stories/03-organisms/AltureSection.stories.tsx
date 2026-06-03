import type { Meta, StoryObj } from "@storybook/react";
import {
  AccordionGroup,
  Button,
  Eyebrow,
  Tag,
  TagGroup,
  getHeadingStyle,
  headingClass,
} from "@worldnote/ui";

const meta = {
  title: "03-Organisms/Alture Section",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/** Composed section validating Alture-inspired patterns together. */
export const FAQSection: Story = {
  render: () => (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-3xl bg-wn-mono-950 p-8">
      <div className="flex flex-col gap-2">
        <Eyebrow>FAQ</Eyebrow>
        <h2 className={headingClass.display} style={getHeadingStyle("display")}>
          Answered questions.
        </h2>
        <p className="text-sm font-medium text-wn-mono-400">
          Everything you might want to know—up front.
        </p>
      </div>
      <AccordionGroup
        items={[
          {
            id: "1",
            index: 1,
            title: "What type of clients do you usually work with?",
            content:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin pharetra rutrum purus vel egestas.",
          },
          {
            id: "2",
            index: 2,
            title: "How long does a typical project take?",
            content:
              "Phasellus ut nulla ut odio blandit pretium. Proin sit amet turpis posuere.",
          },
        ]}
        defaultExpandedKeys={["1"]}
      />
    </section>
  ),
};

export const ServicesSection: Story = {
  render: () => (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-3xl bg-wn-mono-950 p-8">
      <div className="flex flex-col gap-2">
        <Eyebrow>Services</Eyebrow>
        <h2 className={headingClass.h1} style={getHeadingStyle("h1")}>
          What we do
        </h2>
        <TagGroup aria-label="Service areas">
          <Tag>Web design</Tag>
          <Tag>Branding</Tag>
          <Tag>Content</Tag>
          <Tag>Social media</Tag>
        </TagGroup>
      </div>
      <Button
        variant="white"
        iconChip={
          <span className="material-symbols-outlined text-base leading-none">
            arrow_forward
          </span>
        }
        iconChipPlacement="end"
      >
        Get in touch
      </Button>
    </section>
  ),
};
