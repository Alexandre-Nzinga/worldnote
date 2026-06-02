import { HeroUIProvider } from "@heroui/react";
import type { ReactNode } from "react";

export function WorldNoteUIProvider({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full text-wn-text">
      <HeroUIProvider>{children}</HeroUIProvider>
    </div>
  );
}
