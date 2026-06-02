import { WorldNoteUIProvider } from "@worldnote/ui";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./theme/ThemeProvider.js";
import "./styles/global.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <WorldNoteUIProvider>
        <App />
      </WorldNoteUIProvider>
    </ThemeProvider>
  </StrictMode>,
);
