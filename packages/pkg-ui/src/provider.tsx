import { HeroUIProvider } from "@heroui/react";
import type { ReactNode } from "react";

export function WorldNoteUIProvider({ children }: { children: ReactNode }) {
  return <HeroUIProvider>{children}</HeroUIProvider>;
}
