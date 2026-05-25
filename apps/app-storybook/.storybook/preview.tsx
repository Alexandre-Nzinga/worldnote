import type { Preview } from "@storybook/react";
import { WorldNoteUIProvider } from "@worldnote/ui";
import "@worldnote/ui/theme/tailwind.css";

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          "00-Brand",
          "01-Atoms",
          "02-Molecules",
          "03-Organisms",
          "04-Layouts",
          "05-Pages",
          "*",
        ],
      },
    },
  },
  decorators: [
    (Story) => (
      <WorldNoteUIProvider>
        <main className="min-h-screen bg-wn-mono-100 p-6 font-sans text-wn-mono-950">
          <Story />
        </main>
      </WorldNoteUIProvider>
    ),
  ],
};

export default preview;
