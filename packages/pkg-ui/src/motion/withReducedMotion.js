/** Instant opacity-only variants when user prefers reduced motion. */
export function reducedMotionVariants(reduced, full, instant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
}) {
    return reduced ? instant : full;
}
