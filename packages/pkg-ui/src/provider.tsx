import { HeroUIProvider } from "@heroui/react";
import type { ReactNode } from "react";

export function WorldNoteUIProvider({ children }: { children: ReactNode }) {
  return (
    <div className="dark min-h-full text-wn-mono-100">
      <HeroUIProvider>{children}</HeroUIProvider>
    </div>
  );
}
