import { usePrefersReducedMotion } from "@worldnote/ui";
import { useEffect, useState } from "react";

export function useCyclingPlaceholder(
  phrases: readonly string[],
  intervalMs: number,
): string {
  const reducedMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const phraseCount = phrases.length;

  useEffect(() => {
    if (reducedMotion || phraseCount <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % phraseCount);
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [intervalMs, phraseCount, reducedMotion]);

  return phrases[activeIndex] ?? phrases[0] ?? "";
}
