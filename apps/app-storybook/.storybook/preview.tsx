import type { Preview } from "@storybook/react";
import { WorldNoteUIProvider } from "@worldnote/ui";
import "@worldnote/ui/theme/tailwind.css";

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: ["Brand", "Atoms", "Molecules", "*"],
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
