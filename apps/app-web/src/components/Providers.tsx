"use client";

import { WorldNoteUIProvider } from "@worldnote/ui";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <WorldNoteUIProvider>{children}</WorldNoteUIProvider>;
}
