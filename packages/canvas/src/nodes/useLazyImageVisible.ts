import { useEffect, useRef, useState, type RefObject } from "react";

const DEFAULT_ROOT_MARGIN = "240px";

/**
 * Defers image loads until the host element is near the viewport.
 * Pairs with React Flow `onlyRenderVisibleElements` for large canvases.
 */
export function useLazyImageVisible<T extends Element = HTMLElement>(
  enabled = true,
  rootMargin = DEFAULT_ROOT_MARGIN,
): { ref: RefObject<T | null>; isVisible: boolean } {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin, threshold: 0 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [enabled, rootMargin]);

  return { ref, isVisible };
}
