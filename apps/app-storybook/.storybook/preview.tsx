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
        <main className="dark min-h-screen bg-background p-4 font-sans text-foreground">
          <Story />
        </main>
      </WorldNoteUIProvider>
    ),
  ],
};

export default preview;
