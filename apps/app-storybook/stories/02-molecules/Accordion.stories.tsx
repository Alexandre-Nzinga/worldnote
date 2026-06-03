import type { Meta, StoryObj } from "@storybook/react";
import { AccordionGroup } from "@worldnote/ui";

const meta = {
  title: "02-Molecules/Accordion",
  component: AccordionGroup,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl rounded-2xl bg-wn-mono-950 p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AccordionGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const faqItems = [
  {
    id: "clients",
    index: 1,
    title: "What type of clients do you usually work with?",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin pharetra rutrum purus vel egestas.",
  },
  {
    id: "timeline",
    index: 2,
    title: "How long does a typical project take?",
    content:
      "Phasellus ut nulla ut odio blandit pretium. Proin sit amet turpis posuere, vehicula est non.",
  },
  {
    id: "support",
    index: 3,
    title: "Do you offer ongoing support after a project ends?",
    content:
      "Proin sit amet turpis posuere, vehicula est non, aliquet mauris.",
  },
];

export const FAQ: Story = {
  args: {
    items: faqItems,
    defaultExpandedKeys: ["clients"],
  },
};
