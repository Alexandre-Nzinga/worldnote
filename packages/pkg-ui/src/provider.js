import { jsx as _jsx } from "react/jsx-runtime";
import { HeroUIProvider } from "@heroui/react";
export function WorldNoteUIProvider({ children }) {
  return _jsx("div", {
    className: "dark min-h-full text-wn-mono-100",
    children: _jsx(HeroUIProvider, { children: children }),
  });
}
