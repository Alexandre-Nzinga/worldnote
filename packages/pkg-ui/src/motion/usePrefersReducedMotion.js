import { useEffect, useState } from "react";
const QUERY = "(prefers-reduced-motion: reduce)";
function getInitialReducedMotion() {
    if (typeof window === "undefined") {
        return false;
    }
    return window.matchMedia(QUERY).matches;
}
/** Respects OS "reduce motion" — use to skip transforms and large slides. */
export function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(getInitialReducedMotion);
    useEffect(() => {
        const media = window.matchMedia(QUERY);
        const onChange = () => {
            setReduced(media.matches);
        };
        onChange();
        media.addEventListener("change", onChange);
        return () => {
            media.removeEventListener("change", onChange);
        };
    }, []);
    return reduced;
}
